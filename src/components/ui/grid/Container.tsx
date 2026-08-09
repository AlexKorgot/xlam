import {
  forwardRef,
  type ComponentPropsWithoutRef,
} from 'react';
import clsx from 'clsx';

export const PAGE_GUTTER_CLASS_NAME =
  'w-full px-4 sm:px-8 max-[999px]:[@media_(orientation:landscape)]:!px-4';

export const PAGE_CONTAINER_CLASS_NAME =
  'relative mx-auto w-full max-w-[1740px] px-[15px]';

interface ContainerProps extends ComponentPropsWithoutRef<'div'> {
  outerClassName?: string;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ children, className, outerClassName, ...props }, ref) {
    return (
      <div className={clsx(PAGE_GUTTER_CLASS_NAME, outerClassName)}>
        <div
          ref={ref}
          className={clsx(PAGE_CONTAINER_CLASS_NAME, className)}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  },
);
