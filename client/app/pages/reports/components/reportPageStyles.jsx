export const reportPageStyles = (colorTextHex, colorBodyHex) => {
  return {
    default: {
      color: {
        width: "36px",
        height: "14px",
        display: "inline-block",
        borderRadius: "2px",
        background: `${colorTextHex}`,
        position: "relative",
        marginRight: "10px",
        top: "3px",
      },
      colorSpanElement: {
        marginRight: "6px",
      },
      colorBody: {
        width: "36px",
        height: "14px",
        display: "inline-block",
        borderRadius: "2px",
        background: `${colorBodyHex}`,
        position: "relative",
        top: "3px",
      },
      swatch: {
        padding: "4px 8px",
        background: "#fff",
        borderRadius: "1px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        display: "inline-block",
        cursor: "pointer",
        lineHeight: "25px",
      },
      popover: {
        position: "absolute",
        top: "115px",
        zIndex: "2",
      },
      popoverSecond: {
        position: "absolute",
        top: "115px",
        zIndex: "2",
        marginLeft: "15vw",
      },
      cover: {
        position: "fixed",
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    },
  }
}