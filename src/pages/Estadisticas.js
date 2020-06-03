import React, { useEffect, useState, useRef } from "react"
import { useResizeObserver } from "use-events"
import styled from "styled-components"
import * as d3 from "d3"
import { useDispatch, useSelector } from "react-redux"
import { bl } from "../redux"

export default function Estadisticas()
{
    const dispatch = useDispatch()
    const rawData = useSelector(st=>st.fb.stats)

    // const genChart = () =>
    // {
    //     d3.select('.stats').remove()
    //     const maxVal = calculateMax()
    //     const domAxisField = 'fecha'
    //     const valAxisField = 'total'

    //     const domValue = d => d[domAxisField]
    //     const valValue = d => d[valAxisField]

    //     let svgGlobal = d3.select(svgRef.current),
    //         margin = {top: 20, right: 20, bottom: 110, left: 50},
    //         width = dimensions.width - margin.left - margin.right,
    //         height = 500 - margin.top - margin.bottom,
    //         margin2 = {top: 430, right: 20, bottom: 30, left: 50},
    //         height2 = 500 - margin2.top - margin2.bottom

    //     const svg = svgGlobal.append('g').attr('class', 'stats')

    //     let x = d3.scaleTime().range([0, width]),
    //         y = d3.scaleLinear().range([height, 0]),
    //         x2 = d3.scaleTime().range([0, width]),
    //         y2 = d3.scaleLinear().range([height2, 0])

    //     let xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat('%d-%m-%y'))

    //     let xAxis2 = d3.axisBottom(x2).tickFormat(d3.timeFormat('%d-%m-%y')).ticks(5)

    //     let yAxis = d3.axisLeft(y).tickSize(-width).tickPadding(10)
    //     let line = d3.line().x(d => x(d[domAxisField])).y(d => y(d[valAxisField])).curve(d3.curveMonotoneX)
    //     let line2 = d3.line().x(d => x2(d[domAxisField])).y(d => y2(d[valAxisField])).curve(d3.curveMonotoneX)

    //     svg
    //         .append('clipPath')
    //         .attr('id', 'clip')
    //         .append('rect')
    //         .attr('width', width)
    //         .attr('height', height)
    //         .attr('x', 0)
    //         .attr('y', 0)

    //     let clipLineas = svg
    //         .append('g')
    //         .attr('class', 'clipLineas')
    //         .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    //     let axisXY = svg
    //         .append('g')
    //         .attr('class', 'axisXY')
    //         .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    //     let miniMap = svg
    //         .append('g')
    //         .attr('class', 'miniMap')
    //         .attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')')

    //     ////////////////////////////////////////////////////////////////////
    //     //AXIS
    //     ////////////////////////////////////////////////////////////////////
    //     x.domain([new Date("05-01-2020"), new Date()])
    //     y.domain([0, maxVal])
    //     x2.domain(x.domain())
    //     y2.domain(y.domain())

    //     axisXY.append('g').attr('class', 'axis axis--x').attr('transform', 'translate(0,' + height + ')').call(xAxis)
    //     axisXY.append('g').attr('class', 'axis axis--y').call(yAxis)
    //     //var points = clipLineas.append('g').attr('clip-path', 'url(#clip)')

    //     rawData.forEach((item, i) =>
    //     {
    //         if (!item.enabled) return
    //         const arrayVersion = rawData.find(x => x.id === item.id)

    //         clipLineas.append('path')
    //             .datum(arrayVersion.evolucion)
    //             .attr('clip-path', 'url(#clip)')
    //             .attr('d', line)
    //             .attr("stroke", arrayVersion.color) // set color
    //             .attr("stroke-width", 2)
    //             .attr("fill", "none")
    //             .attr('class', 'lineVersion')


    //         clipLineas.append('g')
    //             .attr('clip-path', 'url(#clip)')
    //             .selectAll('.dot')
    //             .data(arrayVersion.evolucion)
    //             .enter()
    //             .append('circle')
    //             .attr('class', 'dot')
    //             .attr('cx', d => x(domValue(d)))
    //             .attr('cy', d => y(valValue(d)))
    //             .attr('r', 4)
    //             .attr('pointer-events', 'all')
    //             .on('mouseover', function (d)
    //             {
    //                 const tt = svg.append('g').attr('id', 'tt')
    //                 tt
    //                     .append('text')
    //                     .text("v" + item.id + ": " + d[valAxisField])
    //                     .attr('text-anchor', 'middle')
    //                     .attr('transform', 'translate(' + (x(d.fecha) + 38) + ',' + (y(d.total) + 10) + ')')
    //                     .transition()
    //                     .duration(500)
    //                     .attr('y', -5)
    //                     .attr('opacity', 1)
    //             })
    //             .on('mouseout', function (d)
    //             {
    //                 svg.select('#tt').remove()
    //             })

    //         miniMap.append('path')
    //             .datum(arrayVersion.evolucion)
    //             .attr('d', line2)
    //             .attr("stroke", arrayVersion.color) // set color
    //             .attr("stroke-width", 2)
    //             .attr("fill", "none")
    //             .attr('class', 'lineVersion')
    //     })
    //     miniMap.append('g').attr('class', 'axis axis--x').attr('transform', 'translate(0,' + height2 + ')').call(xAxis2)

    //     ////////////////////////////////////////////////////////////////////
    //     //ZOOM
    //     ////////////////////////////////////////////////////////////////////
    //     const brushed = () =>
    //     {
    //         if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return

    //         let s = d3.event.selection || x2.range()
    //         x.domain(s.map(x2.invert, x2))
    //         clipLineas.selectAll('.lineVersion').attr('d', line)
    //         axisXY.select('.axis--x').call(xAxis)
    //         clipLineas.selectAll('circle').attr('cx', d => x(domValue(d)))
    //         clipLineas.select('.axis--x').call(xAxis)
    //         svg.select('.zoom').call(zoom.transform, d3.zoomIdentity.scale(width / (s[1] - s[0])).translate(-s[0], 0))
    //     }
    //     let brush = d3.brushX().extent([[0, 0], [width, height2]]).on('brush', brushed)

    //     const zommed = () =>
    //     {
    //         if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return
    //         var evtTrans = d3.event.transform

    //         clipLineas.selectAll('.lineVersion').attr('d', line)
    //         x.domain(evtTrans.rescaleX(x2).domain())

    //         axisXY.select('.axis--x').call(xAxis)

    //         clipLineas.selectAll('circle').attr('cx', d => x(domValue(d)))

    //         miniMap.select('.brush').call(brush.move, x.range().map(evtTrans.invertX, evtTrans))
    //     }
    //     let zoom = d3
    //         .zoom()
    //         .scaleExtent([1, Infinity]) //Infinite
    //         .translateExtent([[0, 0], [width, height]])
    //         .extent([[0, 0], [width, height]])
    //         .on('zoom', zommed)

    //     miniMap.append('g').attr('class', 'brush').call(brush).call(brush.move, [200, x.range()[1]])

    //     clipLineas.append('rect').attr('class', 'zoom').attr('width', width).attr('height', height).lower()
    //     clipLineas.call(zoom)
    // }

    // const convertData = () =>
    // {
    //     var parseTime = d3.timeParse("%Y-%m-%d")
    //     const info = rawData.map((version, i) =>
    //     {
    //         let max = 0
    //         const newEvolucion = version.evolucion.map(d =>
    //         {
    //             if (max < d.total) max = d.total

    //             return {
    //                 fecha: parseTime(d.fecha),
    //                 total: d.total,
    //             }
    //         })
    //         return {
    //             ...version,
    //             maxValue: max,
    //             evolucion: newEvolucion,
    //         }
    //     })
    //     dispatch(vs.infoReady({rawData: info}))
    // }

    useEffect(() => {
        //dispatch(bl.getStatistics())
    }, [])

    // useEffect(
    //     () =>
    //     {
    //         if (rawData && dimensions.width > 0) {
    //             if (!converted) {
    //                 convertData()
    //                 setConverted(true)
    //             } else {
    //                 genChart()
    //             }
    //         }
    //     },
    //     [rawData, dimensions.width]
    // )


    return (
        <></>
        // <StatsFrame ref={wrapperRef}>
        //     <Chart ref={svgRef} />
        // </StatsFrame>
    )
}


const StatsFrame = styled.div`
	--id: StatsFrame;
`
const Chart = styled.svg`
	--id: Chart;
	overflow: visible !important;
	width: 100%;
	filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.4));
`
