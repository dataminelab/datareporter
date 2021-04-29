import React, { useState, useEffect } from "react";
import routes from "@/services/routes";
import Router from "./Router";
import handleNavigationIntent from "./handleNavigationIntent";
import ErrorMessage from "./ErrorMessage";
import CookieConsent from "react-cookie-consent";

export default function ApplicationArea() {
  const [currentRoute, setCurrentRoute] = useState(null);
  const [unhandledError, setUnhandledError] = useState(null);

  useEffect(() => {
    if (currentRoute && currentRoute.title) {
      document.title = currentRoute.title;
    }
  }, [currentRoute]);

  useEffect(() => {
    function globalErrorHandler(event) {
      event.preventDefault();
      setUnhandledError(event.error);
    }

    document.body.addEventListener("click", handleNavigationIntent, false);
    window.addEventListener("error", globalErrorHandler, false);

    return () => {
      document.body.removeEventListener("click", handleNavigationIntent, false);
      window.removeEventListener("error", globalErrorHandler, false);
    };
  }, []);

  if (unhandledError) {
    return <ErrorMessage error={unhandledError} />;
  }

  return <>
    <Router routes={routes.items} onRouteChange={setCurrentRoute} />
    <CookieConsent
      location="bottom"
      buttonText="Accept"
      cookieName="myAwesomeCookieName2"
      style={{ background: "#ffffff", color: "#000000" }}
      buttonStyle={{background: "#1e006f", color: "#ffffff"}}
      containerClasses="consent-box"
      buttonWrapperClasses="consent-buttons"
      buttonClasses="ant-btn ant-btn-primary ant-btn-block"
      expires={150}
    >
      This website uses cookies to offer you a better browsing experience.
      <a href="#">Find out more about how we use cookies and how you can change your settings.</a>
    </CookieConsent>
  </>;

}
