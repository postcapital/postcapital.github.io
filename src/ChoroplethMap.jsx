import { select, color, geoCircle, json, geoGraticule10 } from "d3";
import { geoProjection, geoOrthographic,
  geoNaturalEarth1, geoPath } from 'd3-geo'
import { geoAugustRaw } from 'd3-geo-projection'
import { mesh, feature } from 'topojson'
import { easeCubicInOut } from 'd3-ease'
import { useEffect, useRef } from 'preact/hooks'
import { Component } from 'preact'


export default class ChoroplethMap extends Component {
  constructor( props) {

    super();
    
    this.state = { time: Date.now(),
    data: [], isLoading: true, rotate: [0, 0], 
    projection: null, features: null }
    console.log("ChoroplethMap instantiated with " + props)
  }

  componentWillMount() { 
    fetch("data/countries-50m.json")
    .then((response) => response.json()
    ).then((data) => {

      this.setState({
        data:  data,
        projection: geoOrthographic(),
        isLoading: false
      })
    })
    .catch((error) => {

      console.log('error: fetch failed'+error)
    })

    setInterval(this.update(), 100)
  }

  static interpolateProjection(raw0, raw1) {
    const {scale: scale0, translate: translate0} = ChoroplethMap.fit(raw0);
    const {scale: scale1, translate: translate1} = ChoroplethMap.fit(raw1);
    return t => geoProjection((x, y) => ChoroplethMap.lerp2(raw0(x, y), raw1(x, y), t))
      .scale(ChoroplethMap.lerp1(scale0, scale1, t))
      .translate(lerp2(translate0, translate1, t))
      .precision(0.1)
  }

  animate (state) {
    setTimeout(this.update(state), 100)
  }

  update (state) {
    if (this.state.isLoading == true) return

    const ease = easeCubicInOut
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

      this.setState({rotate: rotate})

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
    const outline = {type: "Sphere"}
    const p = geoProjection(raw).fitExtent([[0.5, 0.5], [width - 0.5, height - 0.5]], outline);
    return {scale: p.scale(), translate: p.translate()};
  }
  
  handleMouseDown = (e) => {
    console.log("handleMouseDown:" + e.pageX)
  }

  handleMouseUp = (e) => {
    console.log("handleMouseUp:" + e.pageX)
  }

  handleMouseMove = (e) => {
    this.setState({rotate: [e.pageX, 0]})
    console.log("handleMouseMove:" + e.pageX)
  }
  
  render(state) {
    
    const width = window.screen.width 
    var featuresPaths = null
    var path = null
    if(this.state.isLoading == false) {
      const countries = feature(this.state.data, this.state.data.objects.countries)
      const height = width
      const outline = {type: "Sphere"}
      const pathGenerator = geoPath().projection(this.state.projection
        .fitExtent([[0.7, 0.7], [width - 0.7, height - 0.7]], outline)
        .rotate(this.state.rotate)
        .scale(width/5))
      featuresPaths  = countries.features.map((f) => {
        return (
          <path d={pathGenerator(f)} 
           fill="#c5d3d8" tooltip="country" />
        )
      })
    }
    return (
      <div>
      { state.isLoading &&
        <img src="../ontheroad_icon.png">On the Road logo</img>
      } 
      { !state.isLoading &&
        <div>
          <svg width={width} height={width}
            onMouseMove={this.handleMouseMove}> 
          <g>{featuresPaths}</g>
          </svg>
        </div>
      }
      </div>
    )
  }
}







