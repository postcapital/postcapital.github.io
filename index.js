

'use strict';

import { h, render, Component } from 'https://cdn.jsdelivr.net/npm/preact@10.27.2/+esm'; // import './ChoropethMap';
import {
    geoAzimuthalEquidistant,
    geoConicEquidistant, geoPath, geoGraticule
} from "https://cdn.jsdelivr.net/npm/d3-geo@3/+esm";
import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

class PostcapitalMap extends Component {
    constructor(props) {

        super();
        const t = new Date().getTimezoneOffset() * 90 | 0;
        this.state = {
            isLandLoading: true,
            isLinksLoading: true,
            isCitiesLoading: true, rotate: [t, -35],
            data: [], links: [], cities: [],
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

    handleTouchUp = (e) => {
        this.setState({
            rotate: [e.touches[0].pageX % window.screen.width, -35],
        })
    }

    handleMouseMove = (e) => {
        this.setState({ rotate: [e.pageX, -35] })
    }

    render(state) {

        // var circle = geoCircle().center([-4.42, 55.84]).radius(1);
        if (!this.state.isLandLoading) {
            const countries = feature(this.state.data, this.state.data.objects.land);
            //const outline = { type: "Sphere" }

            //.fitExtent([[0.7, 0.7], [this.state.widt - 0.7, this.state.height - 0.7]], outline)
            const pathGenerator = geoPath().projection(this.state.projection
                .rotate(this.state.rotate)
                .scale(400).translate([200, 100]));
            //scale(window.screen.width/10)
            const featuresPaths = countries.features.map((f) => {
                const countryName = f.name;

                return h('path', {
                    d: pathGenerator(f),
                    fill: "#c5d3d8", tooltip: countryName
                });
            });
            const populi = this.state.cities.map((c) => {
                // const circle = geoCircle().center([c.longitude, c.latitude]).
                const x = c.population / 5e6;
                const ax = c.longitude;
                const ay = c.latitude;
                //console.log(ax+ay);
                return h('path', {
                    d: pathGenerator({
                        type: "LineString", coordinates: [
                            [ax - x, ay - x],
                            [ax - x, ay + x], [ax + x, ay + x], [ax + x, ay - x],
                            [ax - x, ay - x]]
                    }),
                    stroke: "deeppink",
                    fill: "none",

                    "stroke-opacity": "20%",
                    "stroke-width": 1
                }
                );
            });
            /*
                 const elevations = this.state.cities.map((c) => {
                     // const circle = geoCircle().center([c.longitude, c.latitude]).
                     const x = c.elevation / 1e3;
                     const ax = c.longitude;
                     const ay = c.latitude;
                     //console.log(ax+ay);
                     return h('path', {
                 // equilateral triangles
                         d: pathGenerator({
                             type: "LineString", coordinates: [[ax, ay + x * .577],
                             [ax - x / 2, ay - .288 * x], [ax + x / 2, ay - .288 * x], [ax, ay + x * .577]]
                         }),
                         stroke: "yellow",
                         fill: "none",
     
                         "stroke-opacity": "4%",
                         "stroke-width": 8
                     });
                 })*/

            const graticule = geoGraticule();
            const graticulePaths = graticule.lines().map((g) => {
                return h('path', {
                    d: pathGenerator(g),
                    stroke: "gray",
                    fill: "none",

                    "stroke-opacity": "20%",
                    "stroke-width": 1
                });
            });
            const routesPaths = this.state.links.map((l) => {
                return h('path', {
                    d: pathGenerator({
                        type: "LineString", coordinates: [[l.longitude_from, l.latitude_from],
                        [l.longitude_to, l.latitude_to]]
                    }),
                    fill: "none", stroke: "skyblue",
                    "stroke-linecap": "round",
                    "stroke-opacity": "40%",
                    "stroke-width": l.seats_2024 / 5e5
                });
            });
            return h('div',
                {
                    onMouseMove: this.handleMouseMove,
                    onTouchStart: this.handleMouseDown,
                    onTouchMove: this.handleTouchUp,
                    onTouchEnd: this.handleTouchUp
                }
                , h('svg', { viewBox: `0 0 ${window.screen.width - 8} ${window.screen.width - 5 / 2}` }, h('g',
                    null, featuresPaths.concat(routesPaths).concat(populi)
                        .concat(graticulePaths)

                )
                    //h('g', { style: "stroke-width:8; fill: none"}, routesPaths)
                ));
        } else return h('h4', null, "loading...");
    }
}
const div1 = document.createElement("div");
document.body.appendChild(div1);
render(h(PostcapitalMap), div1);

