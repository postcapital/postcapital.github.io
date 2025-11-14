

'use strict';

// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
// import {forceSimulation, forceCollide, forceX} from "https://cdn.jsdelivr.net/npm/d3-force@3/+esm";
import { h, render, Component } from 'https://cdn.jsdelivr.net/npm/preact@10.27.2/+esm'; // import './ChoropethMap';
import {
    geoProjection, geoOrthographic, geoConicEqualArea, geoCircle,
    geoNaturalEarth1, geoPath
} from "https://cdn.jsdelivr.net/npm/d3-geo@3/+esm";
import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

class PostcapitalMap extends Component {
    constructor(props) {

        super();

        this.state = {
            time: Date.now(),
            data: null, isLoading: true, rotate: [0, 0],
            links: [],
            projection: geoConicEqualArea(), features: null
        }
        console.log("Map instantiated");
    }

    componentWillMount() {
        fetch("data/countries-50m.json")
            .then((response) => response.json()
            ).then((data) => {
                this.setState({
                    data: data,
                    //projection: geoOrthographic(),
                    //isLoading: true
                })
            })
            .catch((error) => {

                console.log('error: fetch failed' + error)
            });
        fetch("data/routes_2024.json").then((response) => response.json())
            .then((data) => {

                this.setState({
                    links: data,
                    isLoading: false,
                })
            }).catch((error) => {


                console.log('error: fetch failed' + error);
            });

        // setInterval(this.update(), 100)
    }

    /*static interpolateProjection(raw0, raw1) {
      const {scale: scale0, translate: translate0} = ChoroplethMap.fit(raw0);
      const {scale: scale1, translate: translate1} = ChoroplethMap.fit(raw1);
      return t => geoProjection((x, y) => ChoroplethMap.lerp2(raw0(x, y), raw1(x, y), t))
        .scale(ChoroplethMap.lerp1(scale0, scale1, t))
        .translate(lerp2(translate0, translate1, t))
        .precision(0.1)
    }*/

    animate(state) {
        setTimeout(this.update(state), 100)
    }

    /*update(state) {
        if (this.state.isLoading == true) return

        // const ease = easeCubicInOut
        // if (r0 === r1) return
        // const interpolate = ChoroplethMap.interpolateProjection(r0, r1)
        // const setState = this.setState
        //const t = Math.min(1,  ease(j / m))
        // const p = geoNaturalEarth1().rotate([performance.now() / 100, 0])
        //console.log('update:' + t)

        const t = Date.now()
        const vx = 0.001, vy = -0.001
        const rotate = [vx * t, vy * t]
        // console.log('setting rotate:' + rotate)
        //const interval = setInterval(function() {
        // method to be executed;
        //}, 50);

        this.setState({ rotate: rotate })

    }*/

    static lerp1(x0, x1, t) {
        return (1 - t) * x0 + t * x1;
    }

    static lerp2([x0, y0], [x1, y1], t) {
        return [(1 - t) * x0 + t * x1, (1 - t) * y0 + t * y1];
    }

    static fit(raw) {
        const width = 600
        const height = 800
        const outline = { type: "Sphere" }
        const p = geoProjection(raw).fitExtent([[0.5, 0.5], [width - 0.5, height - 0.5]], outline);
        return { scale: p.scale(), translate: p.translate() };
    }

    handleMouseDown = (e) => {
        //alert("touch down");
        //this.setState({ rotate: [0, 0] })
        //console.log("handleMouseDown:" + e.pageY)
    }

    handleMouseUp = (e) => {
        //alert(Object.keys(e).toString());
        this.setState({ rotate: [e.touches[0].pageX, e.touches[0].pageY / 10] })
        //console.log("handleMouseUp:" + e.pageY)
    }

    handleMouseMove = (e) => {
        this.setState({ rotate: [e.pageX, e.pageY / 10] })
        //console.log("handleMouseMove:" + e.pageX)
    }


    render(state) {

        const width = window.screen.width;
        var featuresPaths = null
        var path = null
        var circle = geoCircle().center([-4.42, 55.84]).radius(1);
        if (this.state.isLoading != true && this.state.data != null) {
            const countries = feature(this.state.data, this.state.data.objects.countries)
            const height = width
            const outline = { type: "Sphere" }
            const pathGenerator = geoPath().projection(this.state.projection
                .fitExtent([[0.7, 0.7], [width - 0.7, height - 0.7]], outline)
                .rotate(this.state.rotate)
                .scale(width / 5))
            var featuresPaths = countries.features.map((f) => {
                const countryName = f.name;
                return h('path', {
                    d: pathGenerator(f),
                    fill: "#c5d3d8", tooltip: countryName
                });
            });
            var populi = h('path', { d: pathGenerator(circle()), fill: "pink" });

            var routesPaths = this.state.links.map((l) => {
                return h('path', {
                    d: pathGenerator({
                        type: "LineString", coordinates: [[l.longitude_from, l.latitude_from],
                        [l.longitude_to, l.latitude_to]]
                    }
                    ),
                    fill: "none", stroke: "skyblue",
                    "stroke-linecap": "round",
                    "stroke-width": l.seats_2024 / 1e6, tooltip: "route"
                });
            });
            return h('div',
                {
                    onMouseMove: this.handleMouseMove,
                    onTouchStart: this.handleMouseDown,
                    onTouchMove: this.handleMouseUp,
                    onTouchEnd: this.handleMouseUp
                }
                , h('svg', { width: width, height: height }, h('g',
                    null, featuresPaths.concat(routesPaths).concat(populi))
                    //h('g', { style: "stroke-width:8; fill: none"}, routesPaths)
                ));
        } else return h('h4', null, "Loading...");
    }
}

render(h(PostcapitalMap), document.getElementById('pm'));

// exports.default = PostcapitalMap;
