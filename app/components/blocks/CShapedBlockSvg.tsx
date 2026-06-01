import {
  BLOCK_VERTICAL_SPACING,
  LOOP_HEADER_HEIGHT,
  LOOP_FOOTER_HEIGHT,
  LOOP_MIN_INNER_HEIGHT,
} from "../../utils/blockDimensions";

interface CShapedBlockSvgProps {
  color: string;
  stroke: string;
  childrenCount: number;
}

export const getCShapedBlockInnerHeight = (childrenCount: number): number => {
  return childrenCount === 0 ? LOOP_MIN_INNER_HEIGHT : childrenCount * 18;
};

export const getCShapedBlockTotalHeight = (childrenCount: number): number => {
  return (
    LOOP_HEADER_HEIGHT +
    getCShapedBlockInnerHeight(childrenCount) +
    LOOP_FOOTER_HEIGHT
  );
};

export const CShapedBlockSvg = ({
  color,
  stroke,
  childrenCount,
}: CShapedBlockSvgProps) => {
  const innerHeight = getCShapedBlockInnerHeight(childrenCount);
  const totalHeight = LOOP_HEADER_HEIGHT + innerHeight + LOOP_FOOTER_HEIGHT;

  const scale = 1.5;
  const width = 170;
  const innerIndent = 26;
  const notchWidth = 15;
  const notchDepth = 5;
  const notchStart = 19;
  const topOuterNotchShift = 1; // Shift for top outer female notch
  const innerTopNotchShift = 1; // Shift for top inner male notch (5px physical / 1.5 scale)
  const innerBottomNotchShift = 1; // Shift for bottom inner female notch (5px physical / 1.5 scale)
  const bottomOuterNotchShift = 1; // Shift for bottom outer male notch

  const headerBottom = LOOP_HEADER_HEIGHT;
  const innerBottom = headerBottom + innerHeight;
  const svgHeight = totalHeight + notchDepth + 1;

  const path = `
    M${notchStart + topOuterNotchShift} 0.5
    H2C1.17 0.5 0.5 1.17 0.5 2
    V${totalHeight - 2}
    C0.5 ${totalHeight - 1.17} 1.17 ${totalHeight - 0.5} 2 ${totalHeight - 0.5}
    H${notchStart + bottomOuterNotchShift}
    C${notchStart + bottomOuterNotchShift + 0.28} ${totalHeight - 0.5} ${
    notchStart + bottomOuterNotchShift + 0.5
  } ${totalHeight - 0.28} ${notchStart + bottomOuterNotchShift + 0.5} ${
    totalHeight + 1
  }
    V${totalHeight + notchDepth - 1}
    C${notchStart + bottomOuterNotchShift + 0.5} ${
    totalHeight + notchDepth - 0.17
  } ${notchStart + bottomOuterNotchShift + 1.17} ${
    totalHeight + notchDepth + 0.5
  } ${notchStart + bottomOuterNotchShift + 2} ${totalHeight + notchDepth + 0.5}
    H${notchStart + notchWidth + bottomOuterNotchShift}
    C${notchStart + notchWidth + bottomOuterNotchShift + 0.83} ${
    totalHeight + notchDepth + 0.5
  } ${notchStart + notchWidth + bottomOuterNotchShift + 1.5} ${
    totalHeight + notchDepth - 0.17
  } ${notchStart + notchWidth + bottomOuterNotchShift + 1.5} ${
    totalHeight + notchDepth - 1
  }
    V${totalHeight + 1}
    C${notchStart + notchWidth + bottomOuterNotchShift + 1.5} ${
    totalHeight - 0.28
  } ${notchStart + notchWidth + bottomOuterNotchShift + 1.72} ${
    totalHeight - 0.5
  } ${notchStart + notchWidth + bottomOuterNotchShift + 2} ${totalHeight - 0.5}
    H${width - 2}
    C${width - 1.17} ${totalHeight - 0.5} ${width - 0.5} ${
    totalHeight - 1.17
  } ${width - 0.5} ${totalHeight - 2}
    V${innerBottom + 2}
    C${width - 0.5} ${innerBottom + 1.17} ${width - 1.17} ${
    innerBottom + 0.5
  } ${width - 2} ${innerBottom + 0.5}
    H${innerIndent + notchStart + notchWidth + innerBottomNotchShift + 2}
    C${innerIndent + notchStart + notchWidth + innerBottomNotchShift + 1.72} ${
    innerBottom + 0.5
  } ${innerIndent + notchStart + notchWidth + innerBottomNotchShift + 1.5} ${
    innerBottom + 0.72
  } ${innerIndent + notchStart + notchWidth + innerBottomNotchShift + 1.5} ${
    innerBottom + 1
  }
    V${innerBottom + notchDepth - 1}
    C${innerIndent + notchStart + notchWidth + innerBottomNotchShift + 1.5} ${
    innerBottom + notchDepth - 0.17
  } ${innerIndent + notchStart + notchWidth + innerBottomNotchShift + 0.83} ${
    innerBottom + notchDepth + 0.5
  } ${innerIndent + notchStart + notchWidth + innerBottomNotchShift} ${
    innerBottom + notchDepth + 0.5
  }
    H${innerIndent + notchStart + innerBottomNotchShift + 2}
    C${innerIndent + notchStart + innerBottomNotchShift + 1.17} ${
    innerBottom + notchDepth + 0.5
  } ${innerIndent + notchStart + innerBottomNotchShift + 0.5} ${
    innerBottom + notchDepth - 0.17
  } ${innerIndent + notchStart + innerBottomNotchShift + 0.5} ${
    innerBottom + notchDepth - 1
  }
    V${innerBottom + 1}
    C${innerIndent + notchStart + innerBottomNotchShift + 0.5} ${
    innerBottom + 0.72
  } ${innerIndent + notchStart + innerBottomNotchShift + 0.28} ${
    innerBottom + 0.5
  } ${innerIndent + notchStart + innerBottomNotchShift} ${innerBottom + 0.5}
    H${innerIndent + 2}
    C${innerIndent + 1.17} ${innerBottom + 0.5} ${innerIndent + 0.5} ${
    innerBottom - 0.17
  } ${innerIndent + 0.5} ${innerBottom - 1}
    V${headerBottom + 1}
    C${innerIndent + 0.5} ${headerBottom + 0.17} ${innerIndent + 1.17} ${
    headerBottom - 0.5
  } ${innerIndent + 2} ${headerBottom - 0.5}
    H${innerIndent + notchStart + innerTopNotchShift}
    C${innerIndent + notchStart + innerTopNotchShift + 0.28} ${
    headerBottom - 0.5
  } ${innerIndent + notchStart + innerTopNotchShift + 0.5} ${
    headerBottom - 0.28
  } ${innerIndent + notchStart + innerTopNotchShift + 0.5} ${headerBottom + 1}
    V${headerBottom + notchDepth - 1}
    C${innerIndent + notchStart + innerTopNotchShift + 0.5} ${
    headerBottom + notchDepth - 0.17
  } ${innerIndent + notchStart + innerTopNotchShift + 1.17} ${
    headerBottom + notchDepth + 0.5
  } ${innerIndent + notchStart + innerTopNotchShift + 2} ${
    headerBottom + notchDepth + 0.5
  }
    H${innerIndent + notchStart + notchWidth + innerTopNotchShift}
    C${innerIndent + notchStart + notchWidth + innerTopNotchShift + 0.83} ${
    headerBottom + notchDepth + 0.5
  } ${innerIndent + notchStart + notchWidth + innerTopNotchShift + 1.5} ${
    headerBottom + notchDepth - 0.17
  } ${innerIndent + notchStart + notchWidth + innerTopNotchShift + 1.5} ${
    headerBottom + notchDepth - 1
  }
    V${headerBottom + 1}
    C${innerIndent + notchStart + notchWidth + innerTopNotchShift + 1.5} ${
    headerBottom - 0.28
  } ${innerIndent + notchStart + notchWidth + innerTopNotchShift + 1.72} ${
    headerBottom - 0.5
  } ${innerIndent + notchStart + notchWidth + innerTopNotchShift + 2} ${
    headerBottom - 0.5
  }
    H${width - 2}
    C${width - 1.17} ${headerBottom - 0.5} ${width - 0.5} ${
    headerBottom - 1.17
  } ${width - 0.5} ${headerBottom - 2}
    V2
    C${width - 0.5} 1.17 ${width - 1.17} 0.5 ${width - 2} 0.5
    H${notchStart + notchWidth + topOuterNotchShift + 2}
    C${notchStart + notchWidth + topOuterNotchShift + 1.72} 0.5 ${
    notchStart + notchWidth + topOuterNotchShift + 1.5
  } 0.72 ${notchStart + notchWidth + topOuterNotchShift + 1.5} 1
    V${notchDepth - 1}
    C${notchStart + notchWidth + topOuterNotchShift + 1.5} ${
    notchDepth - 0.17
  } ${notchStart + notchWidth + topOuterNotchShift + 0.83} ${
    notchDepth + 0.5
  } ${notchStart + notchWidth + topOuterNotchShift} ${notchDepth + 0.5}
    H${notchStart + topOuterNotchShift + 2}
    C${notchStart + topOuterNotchShift + 1.17} ${notchDepth + 0.5} ${
    notchStart + topOuterNotchShift + 0.5
  } ${notchDepth - 0.17} ${notchStart + topOuterNotchShift + 0.5} ${
    notchDepth - 1
  }
    V1
    C${notchStart + topOuterNotchShift + 0.5} 0.72 ${
    notchStart + topOuterNotchShift + 0.28
  } 0.5 ${notchStart + topOuterNotchShift} 0.5
    Z
  `;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width * scale}
      height={svgHeight * scale}
      viewBox={`0 0 ${width} ${svgHeight}`}
      fill="none"
      style={{ display: "block", pointerEvents: "none" }}
    >
      <path d={path} fill={color} stroke={stroke} style={{ pointerEvents: "auto" }} />
    </svg>
  );
};

export const LOOP_TEXT_TOP = (LOOP_HEADER_HEIGHT * 1.5) / 2;
