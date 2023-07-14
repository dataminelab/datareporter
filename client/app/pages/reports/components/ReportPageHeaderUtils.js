export const restartHash = (table, hash) => {
  window.location.hash = "#" + table + "/4/" + hash;
  return window.location.reload()
}

export const hexToRgb = hex => {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
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

// archive: {
//   isAvailable: !queryFlags.isNew && queryFlags.canEdit && !queryFlags.isArchived,
//   title: "Archive",
//   onClick: archiveReport,
// },
// displayRawData: {
//   isAvailable: true,
//   title: "Display raw data",
//   onClick: () => {document.querySelector("#raw-data-button").click()},
// },

// managePermissions: {
//   isAvailable:
//     !queryFlags.isNew && queryFlags.canEdit && !queryFlags.isArchived && clientConfig.showPermissionsControl,
//   title: "Manage Permissions",
//   onClick: openPermissionsEditorDialog,
// },
// publish: {
//   isAvailable:
//     !isDesktop && queryFlags.isDraft && !queryFlags.isArchived && !queryFlags.isNew && queryFlags.canEdit,
//   title: "Publish",
//   onClick: publishReport,
// },
// unpublish: {
//   isAvailable: !queryFlags.isNew && queryFlags.canEdit && !queryFlags.isDraft,
//   title: "Unpublish",
//   onClick: unpublishReport,
// },

// {
//   showAPIKey: {
//     isAvailable: !queryFlags.isNew,
//     title: "Show API Key",
//     onClick: openApiKeyDialog,
//   },
// },