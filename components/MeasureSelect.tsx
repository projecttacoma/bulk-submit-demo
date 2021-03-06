import { Loader, Select, SelectItem } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { AlertCircle } from 'tabler-icons-react';
import { selectedMeasureState } from '../state/atoms/selectedMeasure';

export default function MeasureSelect() {
  const [measures, setMeasures] = useState<SelectItem[]>([]);
  const [selectedMeasure, setSelectedMeasure] = useRecoilState<{ id: string; url?: string } | null>(
    selectedMeasureState
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasNoMeasures, setHasNoMeasures] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/Measure`)
      .then(res => res.json())
      .then((measuresBundle: fhir4.Bundle) => {
        const measureItems: SelectItem[] =
          measuresBundle.entry?.map(entry => {
            const measure = entry.resource as fhir4.Measure;
            return {
              value: measure.id ?? '',
              label: measure.name ? `${measure.name} (${measure.id})` : measure.id,
              url: measure.url
            };
          }) ?? [];
        if (measureItems.length === 0) {
          setHasNoMeasures(true);
        } else {
          setMeasures(measureItems);
        }
        setIsLoading(false);
      })
      .catch((reason: Error) => {
        setIsLoading(false);
        showNotification({
          title: 'FHIR Server Error',
          message: `Measure listing failed: ${reason.message}. Check if deqm-test-server is running.`,
          disallowClose: true,
          autoClose: false,
          color: 'red',
          icon: <AlertCircle />
        });
      });
  }, []);

  return (
    <Select
      placeholder={hasNoMeasures ? 'No Measures Found' : 'Measure ID'}
      error={hasNoMeasures ? <></> : undefined}
      data={measures}
      value={selectedMeasure ? selectedMeasure.id : ''}
      onChange={measureId => {
        const measure = measures.find(m => m.value === measureId) as SelectItem;
        setSelectedMeasure({ id: measure.value, url: measure.url });
      }}
      rightSection={isLoading ? <Loader size={'sm'} /> : null}
    />
  );
}
