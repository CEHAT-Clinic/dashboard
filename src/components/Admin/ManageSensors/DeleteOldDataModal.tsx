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
 */
function DeleteOldDataModal(): JSX.Element {
  // --------------- State maintenance variables ------------------------
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [areDisclosuresChecked, setAreDisclosuresChecked] = useState([
    false,
    false,
    false,
  ]);

  const allDisclosuresChecked = areDisclosuresChecked.every(Boolean);
  const {isAdmin} = useAuth();

  const {t} = useTranslation('administration');

  /**
   * Resets modal state values before closing the modal.
   */
  function handleClose(): void {
    // Modal state
    setAreDisclosuresChecked([false, false, false]);
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
        (await (await deletionDocRef.get())?.data()?.data) ??
        Object.create(null);

      const offset = 7;
      const deleteBeforeDate = new Date();
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
    <Box marginY={2}>
      <Button colorScheme="red" onClick={onOpen}>
        {t('deleteOldData.launchButton')}
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('deleteOldData.modalHeader')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>{t('deleteOldData.body.paragraph1')}</Text>{' '}
            <Text>{t('deleteOldData.body.paragraph2')}</Text>
            <Divider marginTop={2} marginBottom={2} />
            <CheckboxGroup>
              <Stack mt={1} spacing={1}>
                <Checkbox
                  isChecked={areDisclosuresChecked[0]}
                  onChange={e =>
                    setAreDisclosuresChecked([
                      e.target.checked,
                      areDisclosuresChecked[1],
                      areDisclosuresChecked[2],
                    ])
                  }
                >
                  {t('deleteOldData.conditions.downloaded')}
                </Checkbox>
                <Checkbox
                  isChecked={areDisclosuresChecked[1]}
                  onChange={e =>
                    setAreDisclosuresChecked([
                      areDisclosuresChecked[0],
                      e.target.checked,
                      areDisclosuresChecked[2],
                    ])
                  }
                >
                  {t('deleteOldData.conditions.uploaded')}
                </Checkbox>
                <Checkbox
                  isChecked={areDisclosuresChecked[2]}
                  onChange={e =>
                    setAreDisclosuresChecked([
                      areDisclosuresChecked[0],
                      areDisclosuresChecked[1],
                      e.target.checked,
                    ])
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
