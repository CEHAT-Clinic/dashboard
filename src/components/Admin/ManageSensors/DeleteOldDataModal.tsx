import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure,
  Text,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FaTrash} from 'react-icons/fa';
import {useAuth} from '../../../contexts/AuthContext';
import {firestore} from '../../../firebase';
import {MonthInput, DayInput} from './DownloadData/Util';

/**
 * Modal that allows users to mark old data for deletion
 * Includes button that makes the delete data modal pop up
 */
function DeleteOldDataModal(): JSX.Element {
  // --------------- State maintenance variables ------------------------
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [
    isDownloadedDisclosureChecked,
    setDownloadedDisclosureChecked,
  ] = useState(false);
  const [isUploadedDisclosureChecked, setUploadedDisclosureChecked] = useState(
    false
  );
  const [
    isIrreversibleDisclosureChecked,
    setIrreversibleDisclosureChecked,
  ] = useState(false);

  const {isAdmin} = useAuth();
  const allDisclosuresChecked =
    isDownloadedDisclosureChecked &&
    isUploadedDisclosureChecked &&
    isIrreversibleDisclosureChecked;

  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);
  const [day, setDay] = useState(0);
  const [error, setError] = useState('');
  const validDate = error === '';

  const {t} = useTranslation('administration');

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose(): void {
    // Modal state
    setDownloadedDisclosureChecked(false);
    setUploadedDisclosureChecked(false);
    setIrreversibleDisclosureChecked(false);
    setYear(0);
    setMonth(0);
    setDay(0);
    setError('');

    onClose();
  }

  /**
   * Check that input dates are valid, sets error accordingly
   */
  const yearDigits = 4;
  useEffect(() => {
    const date = new Date(year, month - 1, day);
    /**
     * Determines whether a given date is old enough to serve as the delete before date.
     *
     * @returns Whether the inputted date is old enough to be the delete before date
     */
    const oldEnough = () => {
      const offset = 7;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - offset);

      return date <= sevenDaysAgo;
    };

    if (!year || !month || !day) {
      // If any of the fields are empty
      setError(t('downloadData.error.emptyField'));
    } else if (('' + year).length !== yearDigits) {
      // If the years don't have 4 digits
      setError(t('downloadData.error.yearDigits'));
    } else if (date.getMonth() !== month - 1) {
      // This error is thrown if the `day` is greater than the last
      // day of the `Month` (ex: Feb 31 is invalid)
      setError(t('deleteOldData.invalid'));
    } else if (!oldEnough()) {
      setError(t('deleteOldData.tooRecent'));
    } else {
      setError('');
    }
  }, [year, month, day, t]);

  /**
   * Marks data older than a defined time as ready for deletion by a Cloud Function
   */
  async function markOldDataForDeletion(): Promise<void> {
    if (allDisclosuresChecked && validDate && isAdmin) {
      const sensorsList = await firestore.collection('sensors').get();
      const deletionDocRef = firestore.collection('deletion').doc('todo');

      // Get current mapping or set to empty
      const mapping =
        (await deletionDocRef.get())?.data()?.deletionMap ??
        Object.create(null);

      const deleteBeforeDate = new Date(year, month - 1, day);

      for (const sensorDoc of sensorsList.docs) {
        mapping[sensorDoc.id] = deleteBeforeDate;
      }

      deletionDocRef.update({deletionMap: mapping});
    }
  }

  /**
   * Handle a submission of the deletion modal
   */
  function handleSubmit(): void {
    markOldDataForDeletion().then(handleClose);
  }

  return (
    <Box>
      <Button colorScheme="red" onClick={onOpen}>
        {t('deleteOldData.launchButton')}
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('deleteOldData.modalHeader')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={2}>
              <Text>{t('deleteOldData.body.paragraph1')}</Text>
              <Text>{t('deleteOldData.body.paragraph2')}</Text>
            </Stack>
            <Divider marginTop={2} marginBottom={2} />
            <CheckboxGroup>
              <Stack mt={1} spacing={1}>
                <Checkbox
                  isChecked={isDownloadedDisclosureChecked}
                  onChange={e =>
                    setDownloadedDisclosureChecked(e.target.checked)
                  }
                >
                  {t('deleteOldData.conditions.downloaded')}
                </Checkbox>
                <Checkbox
                  isChecked={isUploadedDisclosureChecked}
                  onChange={e => setUploadedDisclosureChecked(e.target.checked)}
                >
                  {t('deleteOldData.conditions.uploaded')}
                </Checkbox>
                <Checkbox
                  isChecked={isIrreversibleDisclosureChecked}
                  onChange={e =>
                    setIrreversibleDisclosureChecked(e.target.checked)
                  }
                >
                  {t('deleteOldData.conditions.irreversible')}
                </Checkbox>
              </Stack>
            </CheckboxGroup>
            <Divider marginTop={2} marginBottom={2} />
            <FormControl isRequired>
              <FormLabel>{t('deleteOldData.date')}</FormLabel>
              <HStack>
                <NumberInput size="md" width="30%" id="year">
                  <NumberInputField
                    placeholder={t('downloadData.year')}
                    onChange={event => {
                      setYear(+event.target.value);
                    }}
                    value={year}
                  />
                </NumberInput>
                <MonthInput value={month} setValue={setMonth} />
                <DayInput value={day} setValue={setDay} />
              </HStack>
            </FormControl>
            {!validDate && <Text color="red">{error}</Text>}

            <Divider marginTop={2} marginBottom={2} />
            <Flex justifyContent="center">
              <Button
                onClick={handleSubmit}
                colorScheme="red"
                isDisabled={!allDisclosuresChecked || !validDate}
                leftIcon={<FaTrash />}
              >
                {t('deleteOldData.submit')}
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default DeleteOldDataModal;
