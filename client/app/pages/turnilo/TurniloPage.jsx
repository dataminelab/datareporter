import React from "react";
import PropTypes from "prop-types";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import routes from "@/services/routes";
import {Timekeeper} from "@/components/TurniloComponent/common/models/timekeeper/timekeeper";
import {TurniloApplication} from "@/components/TurniloComponent/client/applications/turnilo-application/turnilo-application";
import {init as errorReporterInit} from "@/components/TurniloComponent/client/utils/error-reporter/error-reporter";
import {Ajax} from "@/components/TurniloComponent/client/utils/ajax/ajax";
import {AppSettings} from "@/components/TurniloComponent/common/models/app-settings/app-settings";
//import applyDragAndDropPolyfill from "../TurniloComponent/client/drag-and-drop-polyfill";
import "@/components/TurniloComponent/client/main.scss";
import "@/components/TurniloComponent/client/polyfills";

function TurniloPage({ dashboardSlug, dashboardId, onError }) {

  const config = JSON.parse('{"version":"1.26.0-beta.1","appSettings":{"clusters":[],"customization":{"urlShortener":"return request.get(\'http://tinyurl.com/api-create.php?url=\' + encodeURIComponent(url))\\n"},"dataCubes":[{"name":"wiki","title":"Wikipedia Example","description":"Data cube with *Wikipedia* data.","clusterName":"native","source":"assets/data/wikiticker-2015-09-12-sampled.json","dimensions":[{"name":"time","title":"Time","formula":"$time","kind":"time"},{"name":"channel","title":"Channel","formula":"$channel","kind":"string"},{"name":"cityName","title":"City Name","formula":"$cityName","kind":"string"},{"name":"comments","title":"Comments","dimensions":[{"name":"comment","title":"Comment","formula":"$comment","kind":"string"},{"name":"commentLengths","title":"Comment Lengths","dimensions":[{"name":"commentLength","title":"Comment Length","formula":"$commentLength","kind":"number","description":"Lengths of *all* comments\\n"},{"name":"commentLengthOver100","title":"Comment Length Over 100","formula":"$commentLength > 100","kind":"boolean","description":"`true` only if comment length is over `100`\\n"}],"description":"Length of the comment"}]},{"name":"countryIso","title":"Country ISO","formula":"$countryIsoCode","kind":"string"},{"name":"countryName","title":"Country Name","formula":"$countryName","kind":"string"},{"name":"deltaBucket100","title":"Delta Bucket","formula":"$deltaBucket100","kind":"number"},{"name":"isAnonymous","title":"Is Anonymous","formula":"$isAnonymous","kind":"boolean"},{"name":"isMinor","title":"Is Minor","formula":"$isMinor","kind":"boolean"},{"name":"isNew","title":"Is New","formula":"$isNew","kind":"boolean"},{"name":"isRobot","title":"Is Robot","formula":"$isRobot","kind":"boolean"},{"name":"isUnpatrolled","title":"Is Unpatrolled","formula":"$isUnpatrolled","kind":"string"},{"name":"metroCode","title":"Metro Code","formula":"$metroCode","kind":"string"},{"name":"namespace","title":"Namespace","formula":"$namespace","kind":"string"},{"name":"page","title":"Page","formula":"$page","kind":"string"},{"name":"regionIso","title":"Region ISO","formula":"$regionIsoCode","kind":"string"},{"name":"regionName","title":"Region Name","formula":"$regionName","kind":"string"},{"name":"user","title":"User","formula":"$user","kind":"string"},{"name":"userChars","title":"User Chars","formula":"$userChars","kind":"string"}],"measures":[{"name":"rowsAndDeltas","measures":[{"name":"count","title":"Rows","formula":"$main.count()"},{"name":"deltas","measures":[{"name":"delta","title":"Delta","formula":"$main.sum($delta)"},{"name":"avg_delta","title":"Avg Delta","formula":"$main.average($delta)"}],"title":"Deltas"}],"title":"Rows & Deltas"},{"name":"added","title":"Added","formula":"$main.sum($added)","description":"Sum of all additions\\n"},{"name":"avg_added","title":"Avg Added","formula":"$main.average($added)"},{"name":"deleted","title":"Deleted","formula":"$main.sum($deleted)","description":"Sum of all deletions\\n"},{"name":"avg_deleted","title":"Avg Deleted","formula":"$main.average($deleted)"},{"name":"unique_users","title":"Unique Users","formula":"$main.countDistinct($user)"}],"refreshRule":{"rule":"fixed","time":"2015-09-13T00:00:00.000Z"},"extendedDescription":"Contains data about Wikipedia editors and articles with information about edits, comments and article metadata\\n\\n*Based on wikiticker from 2015-09-12*\\n","defaultDuration":"P1D","defaultSortMeasure":"added","defaultSelectedMeasures":["added"],"defaultPinnedDimensions":["channel","namespace","isRobot"],"timeAttribute":"time","attributes":[{"name":"time","type":"TIME"},{"name":"channel","type":"STRING"},{"name":"cityName","type":"STRING"},{"name":"comment","type":"STRING"},{"name":"countryIsoCode","type":"STRING"},{"name":"countryName","type":"STRING"},{"name":"namespace","type":"STRING"},{"name":"page","type":"STRING"},{"name":"regionIsoCode","type":"STRING"},{"name":"regionName","type":"STRING"},{"name":"sometimeLater","type":"STRING"},{"name":"user","type":"STRING"},{"name":"userChars","type":"SET/STRING"},{"name":"isAnonymous","type":"BOOLEAN"},{"name":"isMinor","type":"BOOLEAN"},{"name":"isNew","type":"BOOLEAN"},{"name":"isRobot","type":"BOOLEAN"},{"name":"isUnpatrolled","type":"BOOLEAN"},{"name":"added","type":"NUMBER"},{"name":"commentLength","type":"NUMBER"},{"name":"deleted","type":"NUMBER"},{"name":"delta","type":"NUMBER"},{"name":"deltaBucket100","type":"NUMBER"},{"name":"deltaByTen","type":"NUMBER"},{"name":"metroCode","type":"NUMBER"}]}]},"timekeeper":{}}');

  if (!config || !config.version || !config.appSettings || !config.appSettings.dataCubes) {
    throw new Error("config not found");
  }
  if (config.appSettings.customization.sentryDSN) {
    errorReporterInit(config.appSettings.customization.sentryDSN, config.version);
  }

  const version = config.version;

  Ajax.version = version;

  const appSettings = AppSettings.fromJS(config.appSettings, {
    executorFactory: Ajax.queryUrlExecutorFactory
  });

  return <turnilo-widget><TurniloApplication
    version={version}
    appSettings={appSettings}
    initTimekeeper={Timekeeper.fromJS(config.timekeeper)}
  /></turnilo-widget>;
}

TurniloPage.propTypes = {
  dashboardSlug: PropTypes.string,
  dashboardId: PropTypes.string,
  onError: PropTypes.func,
};

TurniloPage.defaultProps = {
  dashboardSlug: null,
  dashboardId: null,
  onError: PropTypes.func,
};

// route kept for backward compatibility
routes.register(
  "Turnilo.LegacyAddOrEdit",
  routeWithUserSession({
    path: "/turnilo",
    bodyClass: 'turnilo-widget',
    render: pageProps => <TurniloPage {...pageProps} />,
  })
);
