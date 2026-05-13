import { useEffect, useState } from 'react';
import { getStudentResults } from '../../services/resultApi';

export function useQuery() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getStudentResults();
        setData(res);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading };
}
