import React, { useState } from "react";
import { MdSearch } from "react-icons/md";
import { InputX } from "../src";

export default function App() {
    const [value, setValue] = useState("");
    const [tagValue, setTagValue] = useState("alpha");
    const [reloadCount, setReloadCount] = useState(0);
    const [lastReloadValue, setLastReloadValue] = useState("");
    const [debouncedValue, setDebouncedValue] = useState("");

    const reloadList = () => {
        setReloadCount(count => count + 1);
        setLastReloadValue(value);
    };

    return (
        <main className="page">
            <section className="card">
                <h1>InputX Demo</h1>
                <p className="subtitle">
                    Type to simulate search behavior, clear with the X icon, and
                    click the search icon to focus the field.
                </p>

                <div className="field-wrap">
                    <InputX
                        id="inputx-demo"
                        value={value}
                        onValueChange={setValue}
                        placeholder="Search members..."
                        Icon={MdSearch}
                        iconSize="2rem"
                        autoSearch
                        autoSearchDelay={700}
                        reloadList={reloadList}
                        onDebouncedChange={setDebouncedValue}
                        inputClassName="form-control"
                    />
                </div>

                <div className="field-wrap second-field">
                    <InputX
                        id="inputx-uncontrolled"
                        defaultValue="Try escape to clear"
                        placeholder="Uncontrolled input"
                        clearOnEscape
                        endAdornment={<small className="hint">optional</small>}
                        onDebouncedChange={setTagValue}
                        debounceMs={400}
                        inputClassName="form-control"
                    />
                </div>

                <div className="metrics" aria-live="polite">
                    <p>
                        <strong>Current value:</strong> {value || "(empty)"}
                    </p>
                    <p>
                        <strong>Debounced value:</strong>{" "}
                        {debouncedValue || "(empty)"}
                    </p>
                    <p>
                        <strong>Reload trigger count:</strong> {reloadCount}
                    </p>
                    <p>
                        <strong>Last reload value:</strong>{" "}
                        {lastReloadValue || "(empty)"}
                    </p>
                    <p>
                        <strong>Second field debounced output:</strong>{" "}
                        {tagValue || "(empty)"}
                    </p>
                </div>
            </section>
        </main>
    );
}
