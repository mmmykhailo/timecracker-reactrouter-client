import { useCallback, type ChangeEvent, type FocusEvent } from "react";

function transformInputValue(value: string) {
  let [hours, minutes] = value.replace(/[^0-9:]/g, "").split(":");

  minutes = (minutes || "").slice(0, 2);

  if (hours[0] && Number(hours[0]) > 2) {
    hours = `0${hours[0]}`;
  }
  if (!minutes[0] && hours.length > 2) {
    minutes = `${hours[2]}${hours[3] || ""}`;
  }
  if (minutes[0] && Number(minutes[0]) > 5) {
    minutes = `0${minutes[0]}`;
  }
  hours = hours.slice(0, 2);

  if (Number(hours) > 23) {
    hours = "23";
  }

  if (minutes) {
    return `${hours}:${minutes}`;
  }
  return hours;
}

export function useTimeInput() {
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;

    input.value = transformInputValue(e.target.value);
  }, []);

  const onBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    const input = e.target;

    const [hours, minutes] = input.value.split(":");

    if (!hours && !minutes) {
      input.value = "";
      return;
    }

    input.value = `${hours.padStart(2, "0")}:${(minutes || "0").padStart(2, "0")}`;
  }, []);

  return {
    onChange,
    onBlur,
  } as const;
}
