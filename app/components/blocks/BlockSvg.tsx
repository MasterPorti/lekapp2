import { getSvgDimensions } from "../../utils/blockDimensions";
import { CShapedBlockSvg } from "./CShapedBlockSvg";

interface BlockSvgProps {
  type: string;
  text: string;
  color: string;
  stroke: string;
  childrenCount?: number;
}

export const BlockSvg = ({ type, text, color, stroke, childrenCount = 0 }: BlockSvgProps) => {
  if (type === "control-loop") {
    return (
      <CShapedBlockSvg
        color={color}
        stroke={stroke}
        childrenCount={childrenCount}
      />
    );
  }

  const dimensions = getSvgDimensions(type, text);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={dimensions.width}
      height="62"
      viewBox={dimensions.viewBox}
      fill="none"
      style={{ pointerEvents: "none" }}
    >
      <path
        d={dimensions.path}
        fill={color}
        stroke={stroke}
        style={{ pointerEvents: "auto" }}
      />
    </svg>
  );
};
