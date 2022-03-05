import { noop } from "lodash";
import { useCallback, useState } from "react";
import { Report } from "@/services/report";

export default function useDuplicateReport(report) {
  const [isDuplicating, setIsDuplicating] = useState(false);

  const duplicateReport = useCallback(() => {
    // To prevent opening the same tab, name must be unique for each browser
    const tabName = `duplicatedReportTab/${Math.random().toString()}`;

    // We should open tab here because this moment is a part of user interaction;
    // later browser will block such attempts
    const tab = window.open("", tabName);

    setIsDuplicating(true);
    Report.fork({ id: report.id })
      .then(newReport => {
        tab.location = newReport.getUrl(true);
      })
      .finally(() => {
        setIsDuplicating(false);
      });
  }, [report.id]);

  return [isDuplicating, isDuplicating ? noop : duplicateReport];
}
