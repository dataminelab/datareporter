export const replaceHash = (model:any, hash:any) => {
  const { table } = model;
  window.location.hash = "#" + table + "/4/" + hash;
}

export const hexToRgb = (hex:any) => {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m:number, r:number, g:number, b:number) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1,
      }
    : null;
};

var buttonVisible = false;
export function setPriceButton(price: number, proceedData: number, set: boolean = false) {
  // args: price, proceedData, set
  // set:
  //    TRUE means set given data into local storage
  //    FALSE means only set data into the divs, 
  //      so FALSE also means it is initial construction of the page
  const mediaButton = document.getElementById("meta-button");
  if (!mediaButton) return;
  if (!buttonVisible) {
    buttonVisible = true;
    mediaButton.style.display = "block";
  }

  let priceDiv = document.querySelector("#_price");
  let currentPrice = price + Number(priceDiv.getAttribute("alt"));
  priceDiv.innerHTML = "Price: " + currentPrice.toString().slice(0,9) + " $";     
  let bytesDiv = document.querySelector("#_proceed_data");
  let currentBytes = proceedData + Number(bytesDiv.getAttribute("alt"))
  let gbType = (currentBytes / 8) / 1024 / 1024 / 1024;
  bytesDiv.innerHTML = "Bytes: " + gbType.toString().slice(0,9) + " GB";
  priceDiv.setAttribute("alt", currentPrice.toString());
  bytesDiv.setAttribute("alt", currentBytes.toString());
  if (set) {
    localStorage.setItem(`${window.location.pathname}-proceed_data`, currentBytes.toString());
    localStorage.setItem(`${window.location.pathname}-price`, currentPrice.toString());
  }
}