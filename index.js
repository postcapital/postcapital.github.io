

'use strict';

// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
// import {forceSimulation, forceCollide, forceX} from "https://cdn.jsdelivr.net/npm/d3-force@3/+esm";
import { h, render, Component } from 'https://cdn.jsdelivr.net/npm/preact@10.27.2/+esm'; // import './ChoropethMap';
import {
    geoProjection, geoOrthographic,
    geoNaturalEarth1, geoPath
} from "https://cdn.jsdelivr.net/npm/d3-geo@3/+esm";
import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

class PostcapitalMap extends Component {
    constructor(props) {

        super();

        this.state = {
            time: Date.now(),
            data: [], isLoading: true, rotate: [0, 0],
            projection: null, features: null
        }
        console.log("Map instantiated with " + props)
    }

    componentWillMount() {
        fetch("data/countries-50m.json")
            .then((response) => response.json()
            ).then((data) => {
                this.setState({
                    data: data,
                    projection: geoOrthographic(),
                    isLoading: false
                })
            })
            .catch((error) => {

                console.log('error: fetch failed' + error)
            })

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

    update(state) {
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
        console.log('setting rotate:' + rotate)
        //const interval = setInterval(function() {
        // method to be executed;
        //}, 50);

        this.setState({ rotate: rotate })

    }

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
        console.log("handleMouseDown:" + e.pageY)
    }

    handleMouseUp = (e) => {
        console.log("handleMouseUp:" + e.pageY)
    }

    handleMouseMove = (e) => {
        this.setState({ rotate: [e.pageX, 0] })
        console.log("handleMouseMove:" + e.pageX)
    }

    
    render(state) {

        const width = window.screen.width;
        var featuresPaths = null
        var path = null
        if (this.state.isLoading == false) {
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

    const link = [
        {type: "LineString", coordinates: [[100, 60], [-60, -30]]},
        {type: "LineString", coordinates: [[10, -20], [-60, -30]]},
        {type: "LineString", coordinates: [[10, -20], [130, -30]]}
      ]
            var routesPaths = link.map( (l) => {
                return h('path', {
                    d: pathGenerator(l),
                    fill: "none", stroke: "yellow", "stroke-width": 8, tooltip: "route"
                });
            });
            return h('div',
                { onMouseMove: this.handleMouseMove }
                , h('svg', { width: width, height: height }, h('g',
                    null, featuresPaths.concat(routesPaths))
                    //h('g', { style: "stroke-width:8; fill: none"}, routesPaths)
                ));
        }
    }
}

render(h(PostcapitalMap), document.body);

// exports.default = PostcapitalMap;
