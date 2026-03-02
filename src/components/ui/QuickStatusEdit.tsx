import StatusBadge from "./StatusBadge";
import Dropdown from "./Dropdown";

type Props = {
  status: "Present" | "Late" | "Absent";
  onChange: (status: "Present" | "Late" | "Absent") => void;
};

const statusOptions = [
  { value: "Present", label: "Present" },
  { value: "Late", label: "Late" },
  { value: "Absent", label: "Absent" },
];

export default function QuickStatusEdit({ status, onChange }: Props) {
  return (
    <Dropdown
      value={status}
      options={statusOptions}
      onChange={(value) => onChange(value as "Present" | "Late" | "Absent")}
    >
      <div className="inline-block">
        <StatusBadge status={status} />
      </div>
    </Dropdown>
  );
}
