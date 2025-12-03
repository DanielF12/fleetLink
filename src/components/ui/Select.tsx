import * as React from "react"
import {
    Select as ShadcnSelectRoot,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ShadcnSelect"

interface SelectProps {
    label?: string
    error?: string
    options: { value: string; label: string }[]
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
    placeholder?: string
    disabled?: boolean
    className?: string
    name?: string
    id?: string
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
    ({ label, error, options, value, onChange, placeholder = "Select...", disabled, className, name, id }, ref) => {

        const handleValueChange = (newValue: string) => {
            if (onChange) {
                // Create a synthetic event to match the expected interface
                const syntheticEvent = {
                    target: {
                        value: newValue,
                        name: name,
                        id: id
                    }
                } as unknown as React.ChangeEvent<HTMLSelectElement>
                onChange(syntheticEvent)
            }
        }

        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="block text-left text-sm font-medium text-slate-700">
                        {label}
                    </label>
                )}
                <ShadcnSelectRoot
                    value={value}
                    onValueChange={handleValueChange}
                    disabled={disabled}
                >
                    <SelectTrigger ref={ref} className={className} id={id}>
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </ShadcnSelectRoot>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        )
    }
)

Select.displayName = "Select"
