import React from 'react';
import {Select, Box} from '@chakra-ui/react';
import {useTranslation} from 'react-i18next';

/**
 * Interface for the fields of the CSV
 */
interface BodyElement {
  timestamp: string;
  name: string;
  pm25: number;
  percentDiff: number;
  humidity: number;
  latitude: number;
  longitude: number;
}

/**
 * Interface for the labels of the headers in the CSV
 * label - text to be displayed in the CSV file
 * key - string of which json data to use for the given label
 */
interface HeaderElement {
  label: string;
  key: string;
}

/**
 * Props for the CSV Button. This passes the information from the CSV modal to
 * the component that actually downloads the CSV file.
 */
interface CSVButtonProps {
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
  error: string;
  downloadAll: boolean;
  paId: string;
}

/**
 * Props for the month and day input fields used in the `DownloadCSVModal`
 */
interface InputProps {
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Drop-down menu for months of the year
 * @param value - state variable this input displays and changes
 * @param setValue - function that sets the value
 */
const MonthInput: ({value, setValue}: InputProps) => JSX.Element = ({
  value,
  setValue,
}: InputProps) => {
  const {t} = useTranslation('administration');
  const labels = [
    '',
    t('downloadData.months.jan'),
    t('downloadData.months.feb'),
    t('downloadData.months.mar'),
    t('downloadData.months.apr'),
    t('downloadData.months.may'),
    t('downloadData.months.jun'),
    t('downloadData.months.jul'),
    t('downloadData.months.aug'),
    t('downloadData.months.sep'),
    t('downloadData.months.oct'),
    t('downloadData.months.nov'),
    t('downloadData.months.dec'),
  ];
  const options = [];
  for (let i = 1; i < labels.length; i++) {
    options.push(
      <option value={i} key={i}>
        {labels[i]}
      </option>
    );
  }
  return (
    <Box width="30%">
      <Select
        type="number"
        placeholder={t('downloadData.month')}
        value={value}
        onChange={event => {
          setValue(+event.target.value);
        }}
      >
        {options}
      </Select>
    </Box>
  );
};

/**
 * Drop-down menu for days of a month
 * @param value - state variable this input displays and changes
 * @param setValue - function that sets the value
 */
const DayInput: ({value, setValue}: InputProps) => JSX.Element = ({
  value,
  setValue,
}: InputProps) => {
  const {t} = useTranslation('administration');
  const options = [];
  const maxDaysPerMonth = 31;
  for (let i = 0; i < maxDaysPerMonth; i++) {
    options.push(
      <option value={i + 1} key={i}>
        {i + 1}
      </option>
    );
  }
  return (
    <Box width="30%">
      <Select
        placeholder={t('downloadData.day')}
        size="md"
        value={value}
        onChange={event => {
          setValue(+event.target.value);
        }}
      >
        {options}
      </Select>
    </Box>
  );
};

export type {BodyElement, HeaderElement, CSVButtonProps, InputProps};
export {MonthInput, DayInput};
