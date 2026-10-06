type AnalyticsWindow = Window & {
  gtag?: (
    command: "event",
    activity: string,
    parameters: {
      event_category: string;
      event_label: string;
      value: number | string;
    },
  ) => void;
};

interface TrackAnalyticProps {
  activity: string;
  label: string;
  category?: string;
  value?: number | string;
}
export const trackAnalytic = ({
  activity,
  category = "engagement",
  label,
  value = 1,
}: TrackAnalyticProps) => {
  if (typeof window === "undefined") return;
  const { gtag } = window as AnalyticsWindow;
  gtag?.("event", activity, { event_category: category, event_label: label, value });
};
