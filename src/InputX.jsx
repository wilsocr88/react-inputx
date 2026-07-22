import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { MdCancel } from "react-icons/md";
import { styles } from "./InputXStyles";

/**
 * Dynamic input field with optional clear button, adornments, and debounced value callback.
 * Supports controlled (`value`) and uncontrolled (`defaultValue`) usage.
 */
const InputX = forwardRef(function InputX(
    {
        value,
        defaultValue = "",
        setValue,
        onValueChange,
        onChange,
        onDebouncedChange,
        debounceMs = 1000,
        autoSearch = false,
        autoSearchDelay,
        reloadList,
        listQueries,
        id = "inputX",
        name,
        placeholder = "Enter text...",
        type = "text",
        disabled = false,
        readOnly = false,
        required = false,
        autoComplete,
        autoFocus = false,
        inputMode,
        maxLength,
        minLength,
        pattern,
        clearable = true,
        clearOnEscape = false,
        onClear,
        Icon = false,
        iconSize = "1.4rem",
        startAdornment,
        endAdornment,
        className = "",
        inputClassName = "",
        containerStyle,
        inputStyle,
        iconStyle,
        clearButtonStyle,
        clearButtonAriaLabel = "Clear input",
        ...rest
    },
    ref,
) {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const inputRef = useRef(null);
    const debounceTimeoutRef = useRef(null);
    const clearTriggeredRef = useRef(false);
    const previousValueRef = useRef();
    const onDebouncedChangeRef = useRef(onDebouncedChange);
    const reloadListRef = useRef(reloadList);
    const currentValue = isControlled ? value : internalValue;
    const hasDebouncedChangeHandler = typeof onDebouncedChange === "function";
    const hasReloadHandler = autoSearch && typeof reloadList === "function";

    useEffect(() => {
        onDebouncedChangeRef.current = onDebouncedChange;
    }, [onDebouncedChange]);

    useEffect(() => {
        reloadListRef.current = reloadList;
    }, [reloadList]);

    const debounceDelay = useMemo(() => {
        if (typeof autoSearchDelay === "number") return autoSearchDelay;
        return debounceMs;
    }, [autoSearchDelay, debounceMs]);

    const hasStartAdornment = Boolean(startAdornment || Icon);
    const hasEndAdornment = Boolean(endAdornment);

    const focusInput = () => {
        inputRef.current?.focus();
    };

    const emitValue = (nextValue, event) => {
        if (!isControlled) {
            setInternalValue(nextValue);
        }

        if (setValue) {
            setValue(nextValue);
        }

        if (onValueChange) {
            onValueChange(nextValue, event);
        }
    };

    const clearPendingDebounce = () => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
        }
    };

    const cancelLegacyQueries = () => {
        if (!Array.isArray(listQueries)) return;

        listQueries.forEach(query => {
            if (query && typeof query.cancel === "function") {
                query.cancel();
            }
        });
    };

    const triggerClear = () => {
        clearTriggeredRef.current = true;
        clearPendingDebounce();
        emitValue("");

        if (onClear) {
            onClear();
        }
    };

    const handleInputChange = event => {
        const nextValue = event.target.value;
        emitValue(nextValue, event);

        if (onChange) {
            onChange(event);
        }
    };

    const handleKeyDown = event => {
        if (
            clearOnEscape &&
            event.key === "Escape" &&
            currentValue &&
            !disabled &&
            !readOnly
        ) {
            event.preventDefault();
            triggerClear();
        }
    };

    useEffect(() => {
        clearPendingDebounce();

        const shouldDebounce = hasDebouncedChangeHandler || hasReloadHandler;

        if (!shouldDebounce) return;

        debounceTimeoutRef.current = setTimeout(() => {
            if (onDebouncedChangeRef.current) {
                onDebouncedChangeRef.current(currentValue);
            }

            if (hasReloadHandler && reloadListRef.current) {
                reloadListRef.current();
            }

            debounceTimeoutRef.current = null;
        }, debounceDelay);

        return clearPendingDebounce;
    }, [
        autoSearch,
        currentValue,
        debounceDelay,
        hasDebouncedChangeHandler,
        hasReloadHandler,
    ]);

    useEffect(() => {
        const previousValue = previousValueRef.current;
        const isNowEmpty = currentValue === "";
        const becameEmpty = previousValue !== "" && isNowEmpty;
        const isInitialEmpty = previousValue === undefined && isNowEmpty;

        if (!becameEmpty && !isInitialEmpty) {
            previousValueRef.current = currentValue;
            return;
        }

        cancelLegacyQueries();

        if (!clearTriggeredRef.current) {
            reloadListRef.current?.();
        }

        clearTriggeredRef.current = false;
        previousValueRef.current = currentValue;
    }, [currentValue, listQueries]);

    const renderLegacyIcon = () => {
        if (!Icon) return null;

        return typeof Icon === "function" ? <Icon size={iconSize} /> : Icon;
    };

    return (
        <span
            style={{ ...styles.container, ...containerStyle }}
            className={className}
        >
            {hasStartAdornment && (
                <span
                    style={{ ...styles.startAdornment, ...iconStyle }}
                    onClick={focusInput}
                    aria-hidden="true"
                >
                    {startAdornment || renderLegacyIcon()}
                </span>
            )}

            <input
                ref={node => {
                    inputRef.current = node;

                    if (!ref) return;

                    if (typeof ref === "function") {
                        ref(node);
                        return;
                    }

                    ref.current = node;
                }}
                style={{
                    ...styles.input,
                    ...(hasStartAdornment
                        ? styles.inputWithStartAdornment
                        : {}),
                    ...(clearable || hasEndAdornment
                        ? styles.inputWithEndAdornment
                        : {}),
                    ...inputStyle,
                }}
                type={type}
                className={inputClassName}
                id={id}
                name={name}
                placeholder={placeholder}
                value={currentValue}
                disabled={disabled}
                readOnly={readOnly}
                required={required}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                inputMode={inputMode}
                maxLength={maxLength}
                minLength={minLength}
                pattern={pattern}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                {...rest}
            />

            {clearable && currentValue && !disabled && !readOnly && (
                <MdCancel
                    onClick={triggerClear}
                    style={{ ...styles.clearButton, ...clearButtonStyle }}
                    aria-label={clearButtonAriaLabel}
                    role="button"
                    tabIndex={0}
                    onKeyDown={event => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            triggerClear();
                        }
                    }}
                />
            )}

            {hasEndAdornment && (
                <span style={styles.endAdornment} aria-hidden="true">
                    {endAdornment}
                </span>
            )}
        </span>
    );
});

export default InputX;
