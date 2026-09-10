import { useCallback, useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";

import incidentService from "../services/incidentServices";

import type { Incident } from "../types/incident";

const INCIDENT_POLL_INTERVAL = 15_000;

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const mountedRef = useRef(true);
  const requestInProgressRef = useRef(false);
  const hasLoadedRef = useRef(false);

  const loadIncidents = useCallback(async () => {
    if (requestInProgressRef.current || document.visibilityState === "hidden") {
      return;
    }

    requestInProgressRef.current = true;

    if (!hasLoadedRef.current) {
      setLoading(true);
    }

    try {
      const data = await incidentService.getIncidents();

      if (!mountedRef.current) {
        return;
      }

      setIncidents(data);
      setLastUpdatedAt(new Date());
      hasLoadedRef.current = true;
    } catch (error) {
      console.error("Failed to load incidents:", error);
    } finally {
      requestInProgressRef.current = false;

      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadIncidents();
      }
    };

    void loadIncidents();

    const intervalId = window.setInterval(() => {
      void loadIncidents();
    }, INCIDENT_POLL_INTERVAL);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mountedRef.current = false;

      window.clearInterval(intervalId);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadIncidents]);

  const resolveIncident = useCallback(
    async (incidentId: string) => {
      if (resolvingId) {
        return;
      }

      setResolvingId(incidentId);

      try {
        const updatedIncident =
          await incidentService.resolveIncident(incidentId);

        setIncidents((current) =>
          current.map((incident) =>
            incident.id === updatedIncident.id ? updatedIncident : incident,
          ),
        );

        toast.success("Incident resolved");
      } catch (error) {
        console.error("Failed to resolve incident:", error);
        toast.error("Could not resolve incident");
      } finally {
        setResolvingId(null);
      }
    },
    [resolvingId],
  );

  const openIncidents = incidents.filter(
    (incident) => incident.status === "OPEN",
  );

  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "RESOLVED",
  );

  return {
    incidents,
    openIncidents,
    resolvedIncidents,
    loading,
    resolvingId,
    lastUpdatedAt,
    loadIncidents,
    resolveIncident,
  };
}
