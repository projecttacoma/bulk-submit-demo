/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  getMockFetchImplementation,
  getMockFetchImplementationError,
  getMockSlowFetchImplementation,
  mantineRecoilWrap,
  mockResizeObserver
} from '../helpers/testHelpers';
import MeasureSelect from '../../components/MeasureSelect';

const exampleMeasureWithName: fhir4.Measure = {
  resourceType: 'Measure',
  status: 'draft',
  url: 'http://example.com/Measure/example-measure-id',
  id: 'example-measure-with-name',
  name: 'example-measure-name'
};

const exampleMeasureWithoutName: fhir4.Measure = {
  resourceType: 'Measure',
  status: 'draft',
  url: 'http://example.com/Measure/example-measure-id',
  id: 'example-measure-without-name'
};

const bundleWithMeasure: fhir4.Bundle = {
  resourceType: 'Bundle',
  type: 'searchset',
  entry: [
    {
      resource: exampleMeasureWithName
    },
    {
      resource: exampleMeasureWithoutName
    }
  ]
};

const bundleWithNoMeasures: fhir4.Bundle = {
  resourceType: 'Bundle',
  type: 'searchset',
  entry: []
};

describe('MeasureSelect', () => {
  // Workaround for issues with the built-in use-resize-observer in jest
  window.ResizeObserver = mockResizeObserver;

  describe('ok response tests', () => {
    beforeAll(() => {
      global.fetch = getMockFetchImplementation(bundleWithMeasure);
    });

    it('should render select box', async () => {
      await act(async () => {
        render(mantineRecoilWrap(<MeasureSelect />));
      });

      const select = screen.getByPlaceholderText('Measure ID') as HTMLInputElement;

      expect(select).toBeInTheDocument();
    });

    it('should should render an option with measure from response', async () => {
      await act(async () => {
        render(mantineRecoilWrap(<MeasureSelect />));
      });

      const select = screen.getByPlaceholderText('Measure ID') as HTMLInputElement;

      await act(async () => {
        fireEvent.click(select);
      });

      const options = screen.getAllByRole('option') as HTMLOptionElement[];

      expect(options).toBeDefined();
      expect(options).toHaveLength(2);
      expect(options[0]).toBeInTheDocument();
      expect((options[0].attributes as any).url.value).toEqual(exampleMeasureWithName.url);
    });

    it('should update selected value to measure ID', async () => {
      await act(async () => {
        render(mantineRecoilWrap(<MeasureSelect />));
      });

      const select = screen.getByPlaceholderText('Measure ID') as HTMLInputElement;

      expect(select.value).toEqual('');

      await act(async () => {
        fireEvent.change(select, { target: { value: exampleMeasureWithName.id } });
      });

      expect(select.value).toEqual(exampleMeasureWithName.id);
    });

    it('should display id and name when provided', async () => {
      await act(async () => {
        render(mantineRecoilWrap(<MeasureSelect />));
      });

      const select = screen.getByPlaceholderText('Measure ID') as HTMLInputElement;

      await act(async () => {
        fireEvent.click(select);
      });

      const text = screen.getByText(`${exampleMeasureWithName.name} (${exampleMeasureWithName.id})`);
      expect(text).toBeInTheDocument();
    });

    it('should default to display id when name is absent', async () => {
      await act(async () => {
        render(mantineRecoilWrap(<MeasureSelect />));
      });

      const select = screen.getByPlaceholderText('Measure ID') as HTMLInputElement;

      await act(async () => {
        fireEvent.click(select);
      });

      const text = screen.getByText(`${exampleMeasureWithoutName.id}`);
      expect(text).toBeInTheDocument();
    });
  });

  describe('slow response test', () => {
    beforeAll(() => {
      global.fetch = getMockSlowFetchImplementation(bundleWithMeasure, 500);
    });

    it('should should render a loading spinner while waiting for response', async () => {
      await act(async () => {
        render(mantineRecoilWrap(<MeasureSelect />));
      });

      // loading spinner with role 'presentation' should exist at first
      const select = screen.getByPlaceholderText('Measure ID') as HTMLInputElement;
      const loading = screen.queryByRole('presentation');
      expect(loading).toBeInTheDocument();

      // wait for response to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 750));
      });

      await act(async () => {
        fireEvent.click(select);
      });

      // spinner should no longer exist
      const loading2 = screen.queryByRole('presentation');
      expect(loading2).not.toBeInTheDocument();

      const options = screen.getAllByRole('option') as HTMLOptionElement[];

      expect(options).toBeDefined();
      expect(options).toHaveLength(2);
      expect(options[0]).toBeInTheDocument();
      expect((options[0].attributes as any).url.value).toEqual(exampleMeasureWithName.url);
    });
  });

  describe('error response tests', () => {
    beforeAll(() => {
      global.fetch = getMockFetchImplementationError('example error');
    });

    it('should show error notification for bad response', async () => {
      await act(async () => {
        render(mantineRecoilWrap(<MeasureSelect />));
      });

      const errorNotif = screen.getByRole('alert') as HTMLDivElement;
      expect(errorNotif).toBeInTheDocument();

      const errorMessage = within(errorNotif).getByText(/example error/);
      expect(errorMessage).toBeInTheDocument();

      // spinner should no longer exist
      const loading = screen.queryByRole('presentation');
      expect(loading).not.toBeInTheDocument();
    });
  });

  describe('empty measure list tests', () => {
    beforeAll(() => {
      global.fetch = getMockFetchImplementation(bundleWithNoMeasures);
    });

    it('should show error notification for bad response', async () => {
      await act(async () => {
        render(mantineRecoilWrap(<MeasureSelect />));
      });

      const select = screen.getByPlaceholderText('No Measures Found') as HTMLInputElement;
      expect(select).toBeInTheDocument();
      expect(select).toBeInvalid();

      // spinner should not exist
      const loading = screen.queryByRole('presentation');
      expect(loading).not.toBeInTheDocument();
    });
  });
});
