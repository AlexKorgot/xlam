'use client';

import { useId } from 'react';
import { GlitchBrandXIcon } from '@/src/components/ui/GlitchBrandXIcon';
import { BaseModal } from '@/src/components/ui/modal';
import { ServiceModalBody } from './ServiceModalBody';
import { ServiceModalNavigation } from './ServiceModalNavigation';
import { useServiceModalTransition } from './useServiceModalTransition';
import type { ServiceModalContent } from './services.types';

export type { ServiceModalContent, ServiceModalFeature } from './services.types';

type ServiceModalProps = {
  isOpen: boolean;
  content: ServiceModalContent;
  previousLabel: string;
  currentLabel: string;
  nextLabel: string;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onAfterClose?: () => void;
};

export function ServiceModal({
  isOpen,
  content,
  previousLabel,
  currentLabel,
  nextLabel,
  onClose,
  onPrevious,
  onNext,
  onAfterClose,
}: ServiceModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const { displayedState, contentTransitionClass, backgroundTransitionClass } = useServiceModalTransition({
    content, previousLabel, currentLabel, nextLabel, isOpen,
  });
  const footer = (
    <ServiceModalNavigation
      previousLabel={displayedState.previousLabel}
      currentLabel={displayedState.currentLabel}
      nextLabel={displayedState.nextLabel}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  );

  return (
    <BaseModal
      isOpen={isOpen}
      labelledBy={titleId}
      describedBy={descriptionId}
      footer={footer}
      onClose={onClose}
      onPrevious={onPrevious}
      onNext={onNext}
      onAfterClose={onAfterClose}
      closeLabel="Close service modal"
      closeText={<GlitchBrandXIcon className="cursor-pointer" fill="white" />}
      showCloseButtonBorder={false}
      animationDuration={620}
      variant="sheet"
    >
      <ServiceModalBody
        content={displayedState.content}
        isOpen={isOpen}
        titleId={titleId}
        descriptionId={descriptionId}
        contentTransitionClass={contentTransitionClass}
        backgroundTransitionClass={backgroundTransitionClass}
      />
    </BaseModal>
  );
}
