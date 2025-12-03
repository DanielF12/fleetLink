import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { searchAddress, type AddressSuggestion } from '../../services/mapService'
import { useDebounce } from '../../hooks/useDebounce'
import { cn } from '../../lib/utils'
import { Button } from './ShadcnButton'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from './Command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from './Popover'

type AddressAutocompleteProps = {
    label?: string
    value?: string
    onChange: (value: string) => void
    onSelect?: (suggestion: AddressSuggestion) => void
    error?: string
    placeholder?: string
    disabled?: boolean
    className?: string
}

/**
 * Component of address autocomplete
 * @param {string} label - Label of the field
 * @param {string} value - Value of the field
 * @param {function} onChange - Function to change the value of the field
 * @param {string} error - Error message
 * @param {string} placeholder - Placeholder of the field
 * @param {boolean} disabled - If the field is disabled
 * @param {string} className - Custom CSS class
 */

const AddressAutocomplete = ({
    label,
    value,
    onChange,
    onSelect,
    error,
    placeholder = "Search address...",
    disabled,
    className = '',
}: AddressAutocompleteProps) => {
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const debouncedValue = useDebounce(inputValue, 500)

    // Fetch suggestions when debounced value changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedValue || debouncedValue.length < 3) {
                setSuggestions([])
                return
            }

            setIsLoading(true)
            try {
                const results = await searchAddress(debouncedValue)
                setSuggestions(results)
            } catch (error) {
                console.error('Error fetching address suggestions:', error)
                setSuggestions([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchSuggestions()
    }, [debouncedValue])

    const handleSelect = (currentValue: string) => {
        onChange(currentValue)
        setOpen(false)
    }

    return (
        <div className={cn("flex flex-col gap-2 text-left", className)}>
            {label && (
                <label className="text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="secondary"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className={cn(
                            "w-full justify-between bg-white px-3 py-2 h-11 font-normal text-base md:text-sm border border-slate-200 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed disabled:opacity-100",
                            !value && "text-slate-500",
                            error && "border-red-500 focus-visible:ring-red-500/20",
                            className
                        )}
                    >
                        <span className="truncate">
                            {value || placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[60] bg-white" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Digite o endereço..."
                            value={inputValue}
                            onValueChange={setInputValue}
                        />
                        <CommandList>
                            {isLoading && (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    Loading...
                                </div>
                            )}
                            {!isLoading && suggestions.length === 0 && debouncedValue.length >= 3 && (
                                <CommandEmpty>No addresses found.</CommandEmpty>
                            )}
                            {!isLoading && suggestions.length > 0 && (
                                <CommandGroup>
                                    {suggestions.map((suggestion) => (
                                        <CommandItem
                                            key={suggestion.id}
                                            value={suggestion.place_name}
                                            onSelect={() => {
                                                handleSelect(suggestion.place_name)
                                                onSelect?.(suggestion)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === suggestion.place_name ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {suggestion.place_name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    )
}

export default AddressAutocomplete
