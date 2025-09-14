import React from "react"
import { arc } from "d3-shape"
import { scaleLinear } from "d3-scale"
import { format } from "d3-format"

interface GaugeProps {
    value?: number
    min?: number
    max?: number
    label?: string
    units?: string
    scale?: number // scale factor for resizing
}

const Gauge: React.FC<GaugeProps> = ({
    value = 50,
    min = 0,
    max = 100,
    label,
    units,
    scale = 1,
}) => {

    const backgroundArc: string | null = arc()
        .innerRadius(0.65)
        .outerRadius(1)
        .startAngle(-Math.PI / 2)
        .endAngle(Math.PI / 2)
        .cornerRadius(1)
        ({} as any)


    const percentScale = scaleLinear<number, number>()
        .domain([min, max])
        .range([0, 1])
    const percent: number = percentScale(value)


    const angleScale = scaleLinear<number, number>()
        .domain([0, 1])
        .range([-Math.PI / 2, Math.PI / 2])
        .clamp(true)

    const angle: number = angleScale(percent)


    const filledArc: string | null = arc()
        .innerRadius(0.65)
        .outerRadius(1)
        .startAngle(-Math.PI / 2)
        .endAngle(angle)
        .cornerRadius(1)
        ({} as any)


    const colorScale = scaleLinear()
        .domain([0, 1])
        .range(["#dbdbe7", "#4834d4"]);

    const gradientSteps: string[] = colorScale.ticks(10)
        .map((v: number) => String(colorScale(v)));


    const markerLocation: [number, number] = getCoordsOnArc(
        angle,
        1 - ((1 - 0.65) / 2),
    )


    return (
        <div
            style={{
                textAlign: "center",
            }}>
            <svg
                style={{ overflow: "visible" }}
                width={`${9 * scale}em`}
                height={`${4.5 * scale}em`}
                viewBox={[-1, -1, 2, 1].join(" ")}>
                <defs>
                    <linearGradient
                        id="Gauge__gradient"
                        gradientUnits="userSpaceOnUse"
                        x1="-1"
                        x2="1"
                        y2="0">
                        {gradientSteps.map((color: string, index: number) => (
                            <stop
                                key={color}
                                stopColor={color}
                                offset={`${index / (gradientSteps.length - 1)}`}
                            />
                        ))}
                    </linearGradient>
                </defs>
                <path
                    d={backgroundArc || undefined}
                    fill="#dbdbe7"
                />
                <path
                    d={filledArc || undefined}
                    fill="url(#Gauge__gradient)"
                />
                <line
                    y1="-1"
                    y2="-0.65"
                    stroke="white"
                    strokeWidth="0.027"
                />
                <circle
                    cx={markerLocation[0]}
                    cy={markerLocation[1]}
                    r="0.2"
                    stroke="#2c3e50"
                    strokeWidth="0.01"
                    fill={String(colorScale(percent))}
                />
                <path
                    d="M0.136364 0.0290102C0.158279 -0.0096701 0.219156 -0.00967009 0.241071 0.0290102C0.297078 0.120023 0.375 0.263367 0.375 0.324801C0.375 0.422639 0.292208 0.5 0.1875 0.5C0.0852272 0.5 -1.8346e-08 0.422639 -9.79274e-09 0.324801C0.00243506 0.263367 0.0803571 0.120023 0.136364 0.0290102ZM0.1875 0.381684C0.221591 0.381684 0.248377 0.356655 0.248377 0.324801C0.248377 0.292947 0.221591 0.267918 0.1875 0.267918C0.153409 0.267918 0.126623 0.292947 0.126623 0.324801C0.126623 0.356655 0.155844 0.381684 0.1875 0.381684Z"
                    transform={`rotate(${angle * (180 / Math.PI)}) translate(-0.2, -0.33)`}
                    fill="#6a6a85"
                />
            </svg>

            <div style={{
                marginTop: "0.7em",
                fontSize: "0.9em",
                lineHeight: "1em",
                fontWeight: "500",
                fontFeatureSettings: "'zero', 'tnum' 1",
            }}>
                {format(",")(value)}% 
                <span style={{
                    marginLeft: "0.3em",
                    color: "#8b8ba7",
                    lineHeight: "1.3em",
                    fontWeight: "700",
                }}>
                {label}
                </span>
            </div>

      

            {!!units && (
                <div style={{
                    color: "#8b8ba7",
                    lineHeight: "1.3em",
                    fontWeight: "300",
                }}>
                    {units}
                </div>
            )}
        </div>
    )
}


function getCoordsOnArc(angle: number, offset: number = 10): [number, number] {
    return [
        Math.cos(angle - (Math.PI / 2)) * offset,
        Math.sin(angle - (Math.PI / 2)) * offset,
    ]
}

export default Gauge