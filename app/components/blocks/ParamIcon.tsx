interface ParamIconProps {
  param: string;
  size?: number;
}

export const ParamIcon = ({ param, size = 16 }: ParamIconProps) => {
  switch (param) {
    case "X":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path
            d="M3 3L13 13M13 3L3 13"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "TRIANGULO":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <polygon points="8,2 14,14 2,14" />
        </svg>
      );
    case "CUADRADO":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <rect x="2" y="2" width="12" height="12" />
        </svg>
      );
    case "CIRCULO":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <circle cx="8" cy="8" r="6" />
        </svg>
      );
    default:
      return null;
  }
};
