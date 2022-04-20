import { Select, SelectItem } from '@mantine/core';
import { Component, useEffect, useState } from 'react';

export default function MeasureSelect() {
  const [measures, setMeasures] = useState<SelectItem[]>([]);
  const [selectedMeasure, setSelectedMeasure] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/Measure`)
      .then(res => res.json())
      .then((measuresBundle: fhir4.Bundle) => {
        const measureItems: SelectItem[] =
          measuresBundle.entry?.map(entry => {
            let measure = entry.resource as fhir4.Measure;
            return {
              value: measure.id ?? '',
              label: measure.name ? `${measure.name} (${measure.id})` : measure.id
            };
          }) ?? [];
        setMeasures(measureItems);
      });
  }, []);

  return <Select placeholder="Measure ID" data={measures} value={selectedMeasure} onChange={setSelectedMeasure} />;
}