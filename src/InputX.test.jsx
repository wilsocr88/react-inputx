import React, { createRef, useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InputX } from "./index";

function ControlledInput({ initialValue = "", onValueChange, ...props }) {
    const [value, setValue] = useState(initialValue);

    return (
        <InputX
            {...props}
            value={value}
            onValueChange={(nextValue, event) => {
                setValue(nextValue);
                onValueChange?.(nextValue, event);
            }}
        />
    );
}

describe("InputX", () => {
    beforeEach(() => {
        vi.useRealTimers();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("supports uncontrolled input changes, passthrough props, and callback fan-out", async () => {
        const user = userEvent.setup();
        const setValue = vi.fn();
        const onValueChange = vi.fn();
        const onChange = vi.fn();

        render(
            <InputX
                defaultValue="Hi"
                setValue={setValue}
                onValueChange={onValueChange}
                onChange={onChange}
                name="member-search"
                autoComplete="off"
                inputMode="search"
                maxLength={20}
                minLength={2}
                pattern="[A-Za-z ]+"
                required
                className="outer-shell"
                inputClassName="inner-input"
                containerStyle={{ marginTop: "4px" }}
                inputStyle={{ backgroundColor: "rgb(255, 245, 245)" }}
                data-testid="inputx"
            />,
        );

        const input = screen.getByTestId("inputx");

        expect(input).toHaveValue("Hi");
        expect(input).toHaveAttribute("name", "member-search");
        expect(input).toHaveAttribute("autocomplete", "off");
        expect(input).toHaveAttribute("inputmode", "search");
        expect(input).toHaveAttribute("maxlength", "20");
        expect(input).toHaveAttribute("minlength", "2");
        expect(input).toHaveAttribute("pattern", "[A-Za-z ]+");
        expect(input).toBeRequired();
        expect(input).toHaveClass("inner-input");
        expect(input.parentElement).toHaveClass("outer-shell");

        await user.type(input, " there");

        expect(input).toHaveValue("Hi there");
        expect(setValue).toHaveBeenLastCalledWith("Hi there");
        expect(onValueChange).toHaveBeenLastCalledWith(
            "Hi there",
            expect.objectContaining({ type: "change" }),
        );
        expect(onChange).toHaveBeenCalled();
        expect(input).toHaveStyle({ backgroundColor: "rgb(255, 245, 245)" });
        expect(input.parentElement).toHaveStyle({ marginTop: "4px" });
    });

    it("clears a controlled value via click without triggering duplicate legacy reloads", async () => {
        const user = userEvent.setup();
        const setValue = vi.fn();
        const onValueChange = vi.fn();
        const onClear = vi.fn();
        const reloadList = vi.fn();
        const cancelFirst = vi.fn();

        render(
            <ControlledInput
                initialValue="Alpha"
                setValue={setValue}
                onValueChange={onValueChange}
                onClear={onClear}
                reloadList={reloadList}
                listQueries={[{ cancel: cancelFirst }, {}, null]}
            />,
        );

        await user.click(screen.getByLabelText("Clear input"));

        const input = screen.getByRole("textbox");

        expect(input).toHaveValue("");
        expect(setValue).toHaveBeenCalledWith("");
        expect(onValueChange).toHaveBeenCalledWith(
            "",
            undefined,
        );
        expect(onClear).toHaveBeenCalledTimes(1);
        expect(cancelFirst).toHaveBeenCalledTimes(1);
        expect(reloadList).not.toHaveBeenCalled();
    });

    it("clears on Escape only when interactive and shows no clear button when not interactive", () => {
        const onClear = vi.fn();

        const { rerender } = render(
            <InputX defaultValue="Bravo" clearOnEscape onClear={onClear} />,
        );

        const input = screen.getByRole("textbox");
        fireEvent.keyDown(input, { key: "Escape" });

        expect(input).toHaveValue("");
        expect(onClear).toHaveBeenCalledTimes(1);

        rerender(<InputX value="Locked" disabled />);
        expect(screen.queryByLabelText("Clear input")).not.toBeInTheDocument();
        fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
        expect(screen.getByRole("textbox")).toHaveValue("Locked");

        rerender(<InputX value="Read only" readOnly />);
        expect(screen.queryByLabelText("Clear input")).not.toBeInTheDocument();
        fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
        expect(screen.getByRole("textbox")).toHaveValue("Read only");
    });

    it("debounces the latest value and uses autoSearchDelay for legacy reloads", async () => {
        vi.useFakeTimers();
        const onDebouncedChange = vi.fn();
        const reloadList = vi.fn();

        render(
            <InputX
                defaultValue="seed"
                onDebouncedChange={onDebouncedChange}
                autoSearch
                autoSearchDelay={200}
                debounceMs={1000}
                reloadList={reloadList}
            />,
        );

        const input = screen.getByRole("textbox");

        fireEvent.change(input, { target: { value: "abc" } });

        vi.advanceTimersByTime(199);
        expect(onDebouncedChange).not.toHaveBeenCalled();
        expect(reloadList).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);

        expect(onDebouncedChange).toHaveBeenCalledTimes(1);
        expect(onDebouncedChange).toHaveBeenLastCalledWith("abc");
        expect(reloadList).toHaveBeenCalledTimes(1);
    });

    it("supports debounce with only one handler type enabled", () => {
        vi.useFakeTimers();
        const onDebouncedChange = vi.fn();
        const reloadList = vi.fn();

        const { rerender } = render(
            <InputX defaultValue="solo" onDebouncedChange={onDebouncedChange} debounceMs={50} />,
        );

        vi.advanceTimersByTime(50);
        expect(onDebouncedChange).toHaveBeenCalledWith("solo");
        expect(reloadList).not.toHaveBeenCalled();

        onDebouncedChange.mockClear();

        rerender(
            <InputX defaultValue="solo" autoSearch autoSearchDelay={50} reloadList={reloadList} />,
        );

        vi.advanceTimersByTime(50);
        expect(onDebouncedChange).not.toHaveBeenCalled();
        expect(reloadList).toHaveBeenCalledTimes(1);
    });

    it("runs the initial empty legacy cancellation and reload path", async () => {
        const reloadList = vi.fn();
        const cancelQuery = vi.fn();

        render(
            <InputX
                defaultValue=""
                reloadList={reloadList}
                listQueries={[{ cancel: cancelQuery }, { cancel: undefined }, null]}
            />,
        );

        await waitFor(() => {
            expect(cancelQuery).toHaveBeenCalledTimes(1);
            expect(reloadList).toHaveBeenCalledTimes(1);
        });
    });

    it("clears safely when no onClear callback is provided", async () => {
        const user = userEvent.setup();

        render(<InputX defaultValue="Foxtrot" />);

        await user.click(screen.getByLabelText("Clear input"));

        expect(screen.getByRole("textbox")).toHaveValue("");
    });

    it("supports refs, adornments, legacy icons, and keyboard clear activation", async () => {
        const objectRef = createRef();
        const functionRef = vi.fn();
        const onClear = vi.fn();

        const SearchIcon = ({ size }) => <svg data-testid="search-icon" data-size={size} />;

        const { rerender, unmount } = render(
            <InputX
                ref={objectRef}
                defaultValue="Charlie"
                Icon={SearchIcon}
                iconSize="2rem"
                endAdornment={<span data-testid="end-adornment">suffix</span>}
                clearButtonStyle={{ color: "rgb(255, 0, 0)" }}
                clearButtonAriaLabel="Reset value"
                onClear={onClear}
            />,
        );

        expect(objectRef.current).toBe(screen.getByRole("textbox"));
        expect(screen.getByTestId("search-icon")).toHaveAttribute("data-size", "2rem");
        expect(screen.getByTestId("end-adornment")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("search-icon").parentElement);
        expect(screen.getByRole("textbox")).toHaveFocus();

        const clearButton = screen.getByLabelText("Reset value");
        expect(clearButton).toHaveStyle({ color: "rgb(255, 0, 0)" });
        fireEvent.keyDown(clearButton, { key: "Tab" });
        expect(screen.getByRole("textbox")).toHaveValue("Charlie");
        fireEvent.keyDown(clearButton, { key: "Enter" });
        expect(onClear).toHaveBeenCalledTimes(1);
        expect(screen.getByRole("textbox")).toHaveValue("");

        rerender(
            <InputX
                ref={functionRef}
                defaultValue="Delta"
                Icon={<span data-testid="legacy-node">legacy</span>}
                clearable={false}
                startAdornment={<span data-testid="start-adornment">start</span>}
            />,
        );

        expect(functionRef).toHaveBeenCalledWith(screen.getByRole("textbox"));
        expect(screen.getByTestId("start-adornment")).toBeInTheDocument();
        expect(screen.queryByTestId("legacy-node")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Clear input")).not.toBeInTheDocument();

        unmount();

        render(
            <InputX
                defaultValue="Echo"
                Icon={<span data-testid="legacy-node">legacy</span>}
                onClear={onClear}
            />,
        );

        expect(screen.getByTestId("legacy-node")).toBeInTheDocument();
        fireEvent.keyDown(screen.getByLabelText("Clear input"), { key: " " });
        expect(onClear).toHaveBeenCalledTimes(2);
        expect(screen.getByRole("textbox")).toHaveValue("");
    });
});