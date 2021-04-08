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
} from '@chakra-ui/react';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FaTrash} from 'react-icons/fa';
import {useAuth} from '../../../contexts/AuthContext';
import {firestore} from '../../../firebase';

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
  const {t} = useTranslation('administration');

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose(): void {
    // Modal state
    setDownloadedDisclosureChecked(false);
    setUploadedDisclosureChecked(false);
    setIrreversibleDisclosureChecked(false);
    onClose();
  }

  /**
   * Marks data older than a defined time as ready for deletion by a Cloud Function
   */
  async function markOldDataForDeletion(): Promise<void> {
    if (allDisclosuresChecked && isAdmin) {
      const sensorsList = await firestore.collection('sensors').get();
      const deletionDocRef = firestore.collection('deletion').doc('todo');

      // Get current mapping or set to empty
      const mapping =
        (await deletionDocRef.get())?.data()?.deletionMap ??
        Object.create(null);

      const offset = 7;
      const deleteBeforeDate = new Date();
      // This marks all data older than a week for deletion
      deleteBeforeDate.setDate(deleteBeforeDate.getDate() - offset);

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
            <Flex justifyContent="center">
              <Button
                onClick={handleSubmit}
                colorScheme="red"
                isDisabled={!allDisclosuresChecked}
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
