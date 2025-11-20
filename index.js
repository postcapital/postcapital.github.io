

'use strict';

// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
// import {forceSimulation, forceCollide, forceX} from "https://cdn.jsdelivr.net/npm/d3-force@3/+esm";
import { h, render, Component } from 'https://cdn.jsdelivr.net/npm/preact@10.27.2/+esm'; // import './ChoropethMap';
import {
    geoProjection, geoConicEquidistant, geoCircle, geoPath
} from "https://cdn.jsdelivr.net/npm/d3-geo@3/+esm";
import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

class PostcapitalMap extends Component {
    constructor(props) {

        super();

        this.state = {
            time: Date.now(),

            data: [], isLandLoading: true,
            isLinksLoading: true,
            isCitiesLoading: true, rotate: [0, 0],
            links: [], cities: [],
            projection: geoConicEquidistant(), features: null
        }
        console.log("Map instantiated");
    }

    componentWillMount() {
        fetch("data/land-110m.json")
            .then((response) => response.json()
            ).then((data) => {
                this.setState({
                    data: data,
                    isLandLoading: false
                    //projection: geoOrthographic(),
                    //isLoading: true
                })
            })
            .catch((error) => {

                console.log('error: fetch failed' + error)
            });
        fetch("data/routes-oag-2024.json").then((response) => response.json())
            .then((data) => {

                this.setState({
                    links: data,
                    isRoutesLoading: false,
                })
            }).catch((error) => {


                console.log('error: fetch failed' + error);
            });

        fetch("data/cities_5e5.json").then((response) => response.json())
            .then((data) => {

                this.setState({
                    cities: data,
                    isCitiesLoading: false,
                })
            }).catch((error) => {


                console.log('error: fetch failed' + error);
            });
        // setInterval(this.update(), 100)
    }

    /*static interpolateProjection(raw0, raw1) {
      const {scale: scale0, translate: translate0} = PostcapitalMap.fit(raw0);
      const {scale: scale1, translate: translate1} = PostcapitalMap.fit(raw1);
      return t => geoProjection((x, y) => PostcapitalMap.lerp2(raw0(x, y), raw1(x, y), t))
        .scale(PostcapitalMap.lerp1(scale0, scale1, t))
        .translate(lerp2(translate0, translate1, t))
        .precision(0.1)
    }*/



    static lerp1(x0, x1, t) {
        return (1 - t) * x0 + t * x1;
    }

    static lerp2([x0, y0], [x1, y1], t) {
        return [(1 - t) * x0 + t * x1, (1 - t) * y0 + t * y1];
    }


    handleMouseDown = (e) => {
        //alert("touch down");
        //this.setState({ rotate: [0, 0] })
        //console.log("handleMouseDown:" + e.pageY)
    }

    handleMouseUp = (e) => {
        this.setState({ rotate: [e.touches[0].pageX, e.touches[0].pageY] })
        //console.log("handleMouseUp:" + e.pageY)
    }

    handleMouseMove = (e) => {
        this.setState({ rotate: [e.pageX, 0] })
        //console.log("handleMouseMove:" + e.pageX)
    }


    render(state) {

        // var featuresPaths = null
        // var path = null
        // var circle = geoCircle().center([-4.42, 55.84]).radius(1);
        if (!this.state.isLandLoading) {
            const countries = feature(this.state.data, this.state.data.objects.land)
            //const outline = { type: "Sphere" }
            
                //.fitExtent([[0.7, 0.7], [this.state.widt - 0.7, this.state.height - 0.7]], outline)
            const pathGenerator = geoPath().projection(this.state.projection
                .rotate(this.state.rotate));
                //fitExtent([0.7,0.7], [window.screen.width, window.screen.height/2]));
                //.scale(this.state.width / 10));
            var featuresPaths = countries.features.map((f) => {
                const countryName = f.name;

                return h('path', {
                    d: pathGenerator(f),
                    fill: "#c5d3d8", tooltip: countryName
                });
            });
            var populi = this.state.cities.map((c) => {

                var circle = geoCircle().center([c.longitude, c.latitude]).radius(c.population / 2e6)();
                return h('path', {
                    d: pathGenerator(circle),
                    stroke: "orange",
                    fill: "none",
                    "stroke-opacity": "30%"
                }
                );
            })

            var routesPaths = this.state.links.map((l) => {
                return h('path', {
                    d: pathGenerator({
                        type: "LineString", coordinates: [[l.longitude_from, l.latitude_from],
                        [l.longitude_to, l.latitude_to]]
                    }
                    ),
                    fill: "none", stroke: "skyblue",
                    "stroke-linecap": "round",
                    "stroke-opacity": "25%",
                    "stroke-width": l.seats_2024 / 4e5, tooltip: "route"
                });
            });
            return h('div',
                {
                    onMouseMove: this.handleMouseMove,
                    onTouchStart: this.handleMouseDown,
                    onTouchMove: this.handleMouseUp,
                    onTouchEnd: this.handleMouseUp
                }
                , h('svg', { width: window.screen.width, height: window.screen.width/2 }, h('g',
                    null, featuresPaths.concat(routesPaths).concat(populi))
                    //h('g', { style: "stroke-width:8; fill: none"}, routesPaths)
                ));
        } else return h('h4', null, "Loading...");
    }
}

render(h(PostcapitalMap), document.getElementById('pm'));

// exports.default = PostcapitalMap;
