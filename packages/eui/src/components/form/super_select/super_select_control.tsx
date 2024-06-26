/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, {
  Ref,
  FunctionComponent,
  ButtonHTMLAttributes,
  ReactNode,
  useEffect,
  useState,
  useMemo,
} from 'react';
import classNames from 'classnames';

import { CommonProps } from '../../common';
import { EuiScreenReaderOnly } from '../../accessibility';

import {
  EuiFormControlLayout,
  EuiFormControlLayoutProps,
} from '../form_control_layout';
import { getFormControlClassNameForIconCount } from '../form_control_layout/_num_icons';
import { useFormContext } from '../eui_form_context';

export interface EuiSuperSelectOption<T> {
  value: NonNullable<T>;
  inputDisplay?: ReactNode;
  dropdownDisplay?: ReactNode;
  disabled?: boolean;
  'data-test-subj'?: string;
}

export interface EuiSuperSelectControlProps<T>
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'placeholder'> {
  buttonRef?: Ref<HTMLButtonElement>;
  /**
   * @default false
   */
  compressed?: boolean;
  /**
   * Expand to fill 100% of the parent.
   * Defaults to `fullWidth` prop of `<EuiForm>`.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * @default false
   */
  isInvalid?: boolean;
  /**
   * @default false
   */
  isLoading?: boolean;
  readOnly?: boolean;

  name?: string;
  placeholder?: ReactNode;
  value?: T;

  options?: Array<EuiSuperSelectOption<T>>;

  /**
   * Creates an input group with element(s) coming before input.
   * `string` | `ReactElement` or an array of these
   */
  prepend?: EuiFormControlLayoutProps['prepend'];

  /**
   * Creates an input group with element(s) coming after input.
   * `string` | `ReactElement` or an array of these
   */
  append?: EuiFormControlLayoutProps['append'];
}

export const EuiSuperSelectControl: <T = string>(
  props: EuiSuperSelectControlProps<T>
) => ReturnType<FunctionComponent<EuiSuperSelectControlProps<T>>> = (props) => {
  const { defaultFullWidth } = useFormContext();
  const {
    buttonRef,
    className,
    options,
    id,
    name,
    fullWidth = defaultFullWidth,
    isLoading = false,
    isInvalid = false,
    readOnly,
    defaultValue,
    compressed = false,
    value,
    placeholder,
    prepend,
    append,
    disabled,
    ...rest
  } = props;
  const numIconsClass = getFormControlClassNameForIconCount({
    isInvalid,
    isLoading,
    isDropdown: true,
  });

  const classes = classNames(
    'euiSuperSelectControl',
    numIconsClass,
    {
      'euiSuperSelectControl--fullWidth': fullWidth,
      'euiSuperSelectControl--compressed': compressed,
      'euiSuperSelectControl--inGroup': prepend || append,
      'euiSuperSelectControl-isLoading': isLoading,
      'euiSuperSelectControl-isInvalid': isInvalid,
    },
    className
  );

  const inputValue = value != null ? value : defaultValue;

  const selectedValue = useMemo(() => {
    if (inputValue != null) {
      const selectedOption = options?.find(
        (option) => option.value === inputValue
      );
      return selectedOption ? selectedOption.inputDisplay : undefined;
    }
  }, [inputValue, options]);

  const showPlaceholder = !!placeholder && !selectedValue;

  // An extra screen reader workaround is required here to make sure `id`s
  // passed from EuiFormRow are inherited by the targetable <button> element
  const [formLabelId, setFormLabelId] = useState('');
  const hasFormLabel = !!formLabelId;
  useEffect(() => {
    if (id) {
      const formRowLabel = `${id}-label`;
      const hasFormLabel = !!document.getElementById(formRowLabel);
      if (hasFormLabel) {
        setFormLabelId(formRowLabel);
      }
    }
  }, [id]);

  const buttonId = hasFormLabel ? `${id}-button` : undefined;
  const ariaLabelledBy = hasFormLabel
    ? `${buttonId} ${formLabelId}`
    : undefined;

  return (
    <>
      <input
        type="hidden"
        id={id}
        name={name}
        value={String(inputValue ?? '')}
        readOnly={readOnly}
      />

      <EuiFormControlLayout
        isDropdown
        fullWidth={fullWidth}
        isLoading={isLoading}
        isInvalid={isInvalid}
        isDisabled={disabled}
        readOnly={readOnly}
        compressed={compressed}
        prepend={prepend}
        append={append}
      >
        <button
          type="button"
          className={classes}
          aria-haspopup="listbox"
          aria-labelledby={ariaLabelledBy}
          id={buttonId}
          disabled={disabled || readOnly}
          // @ts-ignore Using as a selector only for mixin use
          readOnly={readOnly}
          {...rest}
          ref={buttonRef}
        >
          {showPlaceholder ? (
            <span className="euiSuperSelectControl__placeholder">
              {placeholder}
            </span>
          ) : (
            selectedValue
          )}
          {hasFormLabel && (
            // Add a slight pause between reading out the multiple aria-labelledby elements,
            // mimicking how screen readers handle native <select> elements
            <EuiScreenReaderOnly>
              <span>, </span>
            </EuiScreenReaderOnly>
          )}
        </button>
      </EuiFormControlLayout>
    </>
  );
};
