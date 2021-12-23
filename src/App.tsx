/// <reference types="anychart" />
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './App.css';
import _ from "lodash"
import {format, fromUnixTime} from "date-fns"
import 'anychart';

anychart.format.inputLocale('ja-jp');
anychart.format.outputLocale('ja-jp');
const data =  [
  {
    id: "A",
    name: "解体工事",
    children: [
      {
        id: "A-1",
        name: "A工区",
        periods: [
          {id: "A-1-1", start: 1637989200000, end: 1638252000000, taskName: "掘削"},
          {id: "A-1-2", start: 1638428400000, end: 1639123200000, taskName: "土留"},
      ],
      markers: [
        {value: 1637989200000, type: "circle", fill: "white", size: 5},
        {value:  1638252000000, type: "triangle-right", size: 5, fill: "#455a64"},
        {value: 1638428400000, type: "circle", fill: "white", size: 5},
        {value: 1639123200000, type: "triangle-right", size: 5, fill: "#455a64"}
      ]
    },
      {
        id: "A-2",
        name: "B工区",
        periods: [
          {id: "A-2-1", start: 1639209600000, end: 1639555200000, taskName: "掘削"}
      ],
      markers: [
        {value: 1639209600000, type: "circle", fill: "white", size: 5},
        {value: 1639555200000, type: "triangle-right", size: 5, fill: "#455a64"}
      ]
    }
  ]},
  {
    id: "B",
    name: "土留工事",
    children: [
      {
        id: "3",
        name: "基礎",
        children: [
          {
            id: "B-3-1",
            name: "A工区",
            periods: [
              {id: "B-3-1-1", start: 1641452400000, end:  1641798000000, taskName: "タスクA"},
            ],
            markers: [
              {value: 1641452400000, type: "circle", fill: "white", size: 5},
              {value:  1641798000000, type: "triangle-right", size: 5, fill: "#455a64"}
            ]
          },
          {
            id: "B-3-2",
            name: "B工区",
            periods: [
              {id: "B-3-2-1", start: 1641884400000, end: 1642230000000, taskName: "タスクA"},
            ],
            markers: [
              {value: 1641884400000, type: "circle", fill: "white", size: 5},
              {value: 1642230000000, type: "triangle-right", size: 5, fill: "#455a64"}
            ]
          }
        ]}
    ]}
];

function App() {
    const [ganttData, setGanttData] = useState(data) 
    const [selectedPeriod, setSelectedPeriod] = useState<{id: string, parentId: string, start: number, end: number, x: number, y: number} | undefined>(undefined)
    const divRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<any | null>(null)

    useLayoutEffect(() => {
      if (divRef.current) {
        const chart = anychart.ganttResource();
        const treeData = anychart.data.tree(ganttData, 'as-tree')

        chart.data(treeData)
        chart.edit(true);
        const periodLabels = chart.getTimeline().periods().labels();
        periodLabels.enabled(true);
        periodLabels.offsetY(-12)
        periodLabels.useHtml(true);
        periodLabels.format('<p style="color:black;">{%taskName}</p>')

        // access periods
const periods = chart.getTimeline().periods();

// set the height of periods
periods.height(2);
periods.normal().fill("#455a64 0.5")
periods.normal().stroke("#455a64")

chart.dataGrid().rowSelectedFill("#00c9e8")

chart.getTimeline().connectors().fill("#455a64").stroke()

chart.getTimeline().scale().zoomLevels([
  [    {unit: "day", count: 1},
    {unit: "month", count: 1},
    {unit: "quarter", count: 1},
]
]);

chart.getTimeline().columnStroke()
chart.getTimeline().markers().stroke("#455a64");
chart.defaultRowHeight(45)
chart.title('Arent Gantt Chart');
chart.container('container');
chart.draw();
chart.fitAll();

const scale = chart.xScale()

// @ts-ignore
scale.calendar().schedule([
  /* Sun */ null,
  /* Mon */ { from: 10, to: 18 },
  /* Tue */ { from: 10, to: 18 },
  /* Wed */ { from: 10, to: 18 },
  /* Thu */ { from: 10, to: 18 },
  /* Fri */ { from: 10, to: 18 },
  /* Sat */ null
]);

 chart.getTimeline().weekendsFill("pink 0.5").holidaysFill("pink 0.5") // 祝日は自身で設定する必要あり

chart.listen("rowDblClick", e => {
  // @ts-ignore
  const generated = e.item.get("periods").concat({id: Math.random().toString(32).substring(2), start: e.hoverDateTime, end: e.hoverDateTime + 86400 * 1000 * 5, taskName: "new task"}) // idは規則性を持たせた方が楽かも知らん　＆ taskNameを追加したい
  // @ts-ignore
  const generatedMarkers = e.item.get("markers").concat({value: e.hoverDateTime, type: "circle", fill: "white", size: 5}, {value: e.hoverDateTime + 86400 * 1000 * 5, type: "triangle-right", size: 5, fill: "#455a64"})
  // @ts-ignore
const targetId = e.item.get("id")
const target = treeData.search("id", targetId) as anychart.data.Tree.DataItem
target.set("periods", generated)
target.set("markers", generatedMarkers)

})

chart.listen("rowClick", e => {
  // @ts-ignore
  if ("period" in e && e.period !== undefined) {
    // @ts-ignore
    const parentId = e.item.get("id")
      // @ts-ignore
    setSelectedPeriod({id: e.period.id, parentId: parentId, start: e.period.start, end: e.period.end, x: e.originalEvent.clientX, y: e.originalEvent.clientY - 30})
  }
})

treeData.listen("treeItemUpdate", e => {
  // @ts-ignore
  const updatedId = e.item.get("id")
  console.log(updatedId)

})


chartRef.current = chart;
return () => chart.dispose(); 
      }
    }, [ganttData])

  return (
    <>
    <div style={{backgroundColor: "white", zIndex: 1, border: "1px solid black", paddingTop: 4, paddingLeft: 8, paddingRight: 8, display: selectedPeriod ? "block" : "none", position: "absolute", left: selectedPeriod?.x, top: selectedPeriod?.y ? selectedPeriod.y - 40 : 0}}>
      <p style={{margin: 0}}>{format(fromUnixTime(selectedPeriod?.start ?  selectedPeriod.start / 1000 : 0), "yyyy-MM-dd HH:mm") } ~ {format(fromUnixTime(selectedPeriod?.end ? selectedPeriod.end / 1000 : 0), "yyyy-MM-dd HH:mm")}</p>
      <button onClick={() => {
          // Todo:  ganttDataのtree構造の中からid検索して変更
          setSelectedPeriod(undefined)
      }}>+1</button>
    </div>
    <div id="container" style={{height: "1000px"}}>
      <div ref={divRef} style={{ width: "100%" }} />
    </div>
    </>

  );
}

export default App;
