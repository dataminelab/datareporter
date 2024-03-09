import React from "react";
import { clientConfig, currentUser } from "@/services/auth";

const frontendVersion = "dev";

export default function VersionInfo() {
  return (
    <React.Fragment>
      <div className="ver-text">
        Version: {clientConfig.version}
        {frontendVersion !== clientConfig.version && ` (${frontendVersion.substring(0, 8)})`}
      </div>
    </React.Fragment>
  );
}
