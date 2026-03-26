import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import './calendar.css'
import { useContext, useState } from "react";
import { context } from "../Pages/context/context";

function Calendarrr() {
    const {selected, setSelected} = useContext(context);


    return (
        <div className="my-calendar">
            <DayPicker
                mode="single"
                selected={selected}
                onSelect={setSelected}
                footer={
                    selected ? `Selected: ${selected.toLocaleDateString()}` : "Pick a day."
                }
                classNames={{
                    day_selected: "my-selected", // Override selected day style
                    day_today: "my-today",       // Override today's date style
                }}
            />
        </div>
    );
}

export default Calendarrr
