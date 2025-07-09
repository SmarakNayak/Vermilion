import { useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { usePostHog } from 'posthog-js/react'

export default function PostHogPageView() {
  const posthog = usePostHog();
  let location = useLocation();

  useEffect(() => {
    if (posthog) {
      posthog.capture(
        '$pageview',
        {
          '$current_url': window.location.href,
        }
      )
    }
  }, [location])

  return null
}
