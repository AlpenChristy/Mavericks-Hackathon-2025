import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

export interface Report {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  reporter_email?: string;
  reported_item_id?: string;
  reported_user_id?: string;
  item_title?: string;
  item_images?: string[];
  reported_user_name?: string;
  reported_user_email?: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/admin/reports`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }

        const data = await response.json();
        setReports(data.reports || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const updateReportStatus = async (reportId: string, status: 'pending' | 'reviewed' | 'resolved') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update report status');
      }

      const data = await response.json();
      setReports(prev => prev.map(report => 
        report.id === reportId ? { ...report, status: data.report.status } : report
      ));

      return data.report;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update report status');
    }
  };

  return { reports, loading, error, updateReportStatus, setReports };
};

export const useCreateReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReport = async (reportData: {
    reported_item_id?: string;
    reported_user_id?: string;
    reason: string;
    description?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create report');
      }

      const data = await response.json();
      return data.report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create report';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { createReport, loading, error };
}; 