import { Loader, ScrollArea, Center, Text } from '@mantine/core';
import dynamic from 'next/dynamic';

const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false });

export default function DataRequirementsJSON({
  isLoading,
  dataRequirements,
  error
}: {
  isLoading: boolean;
  dataRequirements: fhir4.Library | null;
  error: fhir4.OperationOutcome | null;
}) {
  return <ScrollArea style={{ height: 290 }}>{renderJSONResults(isLoading, dataRequirements, error)}</ScrollArea>;
}

/**
 * Helper function that takes in all data that could potentially be displayed in the window and
 * determines what to show
 * @param isLoading {Boolean} true if the dataRequirements are still loading
 * @param dataRequirements {Object} FHIR dataRequirements calculated by FQM-execution
 * @param error {Object} FHIR OperationOutcome describing an error occurred while calculating dataRequirements
 * @returns JSX with the appropriate component for the situation
 */
function renderJSONResults(
  isLoading: boolean,
  dataRequirements: fhir4.Library | null,
  error: fhir4.OperationOutcome | null
) {
  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  } else if (error) {
    return <DynamicReactJson src={error} indentWidth={2} />;
  } else if (dataRequirements) {
    return <DynamicReactJson src={dataRequirements} indentWidth={2} />;
  } else {
    return (
      <Center>
        <Text>No Data</Text>
      </Center>
    );
  }
}