import React, {useState, useEffect} from 'react';
import {
  Box,
  Button,
  Modal,
  Text,
  Heading,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  FormHelperText,
  HStack,
  Center,
  Checkbox,
  Input,
} from '@chakra-ui/react';
import {useTranslation} from 'react-i18next';
import DownloadCSVButton from './DownloadCSVButton';
import {MonthInput, DayInput} from './Util';

/**
 * Component for the download data modal that appears on the manage sensor page
 * in the administrative pane.
 */
const DownloadCSVModal: () => JSX.Element = () => {
  const {t} = useTranslation('administration');
  /* --------------- State maintenance variables ------------------------ */
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [startYear, setStartYear] = useState(0);
  const [startMonth, setStartMonth] = useState(0);
  const [startDay, setStartDay] = useState(0);
  const [endYear, setEndYear] = useState(0);
  const [endMonth, setEndMonth] = useState(0);
  const [endDay, setEndDay] = useState(0);
  const [error, setError] = useState('');
  const [downloadAll, setDownloadAll] = useState(true);
  const [paId, setPaId] = useState('');
  /* ------------------------------------------------------------------- */

  /**
   * Reset state to initial state
   */
  function resetFields() {
    setStartYear(0);
    setStartMonth(0);
    setStartDay(0);
    setEndYear(0);
    setEndMonth(0);
    setEndDay(0);
    setPaId('');
    setDownloadAll(true);
    setError('');
  }

  /**
   * Reset starting state and close modal
   */
  function handleClose() {
    resetFields();
    onClose();
  }

  /**
   * Check that input dates are valid, sets error accordingly
   */
  const yearDigits = 4;
  useEffect(() => {
    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);
    if (
      !startYear ||
      !endYear ||
      !startMonth ||
      !endMonth ||
      !startDay ||
      !endDay
    ) {
      // If any of the fields are empty
      setError(t('downloadData.error.emptyField'));
    } else if (
      ('' + startYear).length !== yearDigits ||
      ('' + endYear).length !== yearDigits
    ) {
      // If the years don't have 4 digits
      setError(t('downloadData.error.yearDigits'));
    } else if (startDate.getMonth() !== startMonth - 1) {
      // This error is thrown if the `startDay` is greater than the last
      // day of the `startMonth` (ex: Feb 31 is invalid)
      setError(t('downloadData.error.invalidStart'));
    } else if (endDate.getMonth() !== endMonth - 1) {
      // This error is thrown if the `endDay` is greater than the last
      // day of the `endMonth` (ex: Feb 31 is invalid)
      setError(t('downloadData.error.invalidEnd'));
    } else if (startDate > endDate) {
      setError(t('downloadData.error.startBeforeEnd'));
    } else {
      setError('');
    }
  }, [startYear, startMonth, startDay, endYear, endMonth, endDay, t]);

  return (
    <Box>
      <Button colorScheme="teal" onClick={onOpen}>
        {t('downloadData.download')}
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('downloadData.header')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              <FormControl isRequired>
                {/* Start start date input fields */}
                <FormLabel>{t('downloadData.startDate')}</FormLabel>
                <HStack>
                  <NumberInput size="md" width="30%" id="startYear">
                    <NumberInputField
                      placeholder={t('downloadData.year')}
                      onChange={event => {
                        setStartYear(+event.target.value);
                      }}
                      value={startYear}
                    />
                  </NumberInput>
                  <MonthInput value={startMonth} setValue={setStartMonth} />
                  <DayInput value={startDay} setValue={setStartDay} />
                </HStack>
                <FormHelperText paddingBottom={1}>
                  {t('downloadData.startHelper')}
                </FormHelperText>
                {/* End start date input fields */}
                {/* Start end date input fields */}
                <FormLabel>{t('downloadData.endDate')}</FormLabel>
                <HStack>
                  <NumberInput size="md" width="30%" id="endYear">
                    <NumberInputField
                      onChange={event => {
                        setEndYear(+event.target.value);
                      }}
                      value={endYear}
                      placeholder={t('downloadData.year')}
                    />
                  </NumberInput>
                  <MonthInput value={endMonth} setValue={setEndMonth} />
                  <DayInput value={endDay} setValue={setEndDay} />
                </HStack>
                <FormHelperText>{t('downloadData.endHelper')}</FormHelperText>
                {/* End end date input fields */}
                {/* Start Purple Air ID input fields */}
                <Checkbox
                  marginY={2}
                  isChecked={downloadAll}
                  onChange={event => {
                    setDownloadAll(!downloadAll);
                  }}
                  size="md"
                >
                  <Heading size="sm">{t('downloadData.downloadAll')}</Heading>
                </Checkbox>
                {!downloadAll && (
                  <Box>
                    <Text>{t('downloadData.whichSensor')}</Text>
                    <Input
                      placeholder={t('sensors.purpleAirId')}
                      value={paId}
                      onChange={event => {
                        setPaId(event.target.value);
                      }}
                    />
                    <FormHelperText marginBottom={2}>
                      {t('downloadData.confirmID')}
                    </FormHelperText>
                  </Box>
                )}
                {/* End Purple Air ID input fields */}
              </FormControl>
            </Box>
            <Center>
              <DownloadCSVButton
                startYear={startYear}
                startMonth={startMonth}
                startDay={startDay}
                endYear={endYear}
                endMonth={endMonth}
                endDay={endDay}
                error={error}
                downloadAll={downloadAll}
                paId={paId}
              />
            </Center>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={handleClose}>
              {t('downloadData.close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export {DownloadCSVButton, DownloadCSVModal};
