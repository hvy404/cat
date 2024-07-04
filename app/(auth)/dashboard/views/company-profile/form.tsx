import React, { useState, ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Linkedin,
  Twitter,
  Facebook,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { states } from "@/lib/data/form-value-states";
import { countries } from "@/lib/data/form-value-countries";
import { companySizes } from "@/lib/data/form-value-company-size";
import { naicsList } from "@/lib/data/form-value-industry-naics";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FormData {
  id: string;
  name: string;
  industry: string;
  size: string;
  foundedYear: string;
  website: string;
  description: string;
  headquarters: {
    city: string;
    state: string;
    country: string;
  };
  socialMedia: {
    linkedin: string;
    twitter: string;
    facebook: string;
  };
  contactEmail: string;
  phoneNumber: string;
  admin: string[];
  manager: string[];
}

type NestedKeys = "headquarters" | "socialMedia";

export default function EditCompanyProfile() {
  const [formData, setFormData] = useState<FormData>({
    id: uuidv4(),
    name: "",
    industry: "",
    size: "",
    foundedYear: "",
    website: "",
    description: "",
    headquarters: {
      city: "",
      state: "",
      country: "",
    },
    socialMedia: {
      linkedin: "",
      twitter: "",
      facebook: "",
    },
    contactEmail: "",
    phoneNumber: "",
    admin: [],
    manager: [],
  });

  const [stateOpen, setStateOpen] = useState(false);
  const [stateValue, setStateValue] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryValue, setCountryValue] = useState("");
  const [sizeOpen, setSizeOpen] = useState(false);
  const [sizeValue, setSizeValue] = useState("");
  const [industryOpen, setIndustryOpen] = useState(false);
  const [industryValue, setIndustryValue] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".") as [NestedKeys, string];
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    console.log("Form data submitted:", formData);
    // Here you would typically send the data to your backend
  };

  return (
    <main className="p-4 w-full overflow-auto">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-md font-bold text-gray-900">Company Profile</h2>
        </div>
        <div className="space-y-6">
          <div>
            <Label htmlFor="name">Company Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter company name"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Popover open={industryOpen} onOpenChange={setIndustryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={industryOpen}
                    className="w-full justify-between"
                  >
                    <span className="truncate">
                      {naicsList.find((i) => i.code === formData.industry)
                        ?.label || "Select industry"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder="Search industry..." />
                    <CommandList>
                      <CommandEmpty>Not found.</CommandEmpty>
                      <CommandGroup>
                        {naicsList.map((industry) => (
                          <CommandItem
                            key={industry.id}
                            onSelect={() => {
                              setIndustryValue(industry.code);
                              setFormData((prev) => ({
                                ...prev,
                                industry: industry.code,
                              }));
                              setIndustryOpen(false);
                            }}
                            className="flex items-center"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 flex-shrink-0",
                                industryValue === industry.code
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <span className="truncate">{industry.label}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="size">Company Size</Label>
              <Popover open={sizeOpen} onOpenChange={setSizeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={sizeOpen}
                    className="w-full justify-between truncate"
                  >
                    {companySizes.find((s) => s.value === formData.size)
                      ?.label || "Select company size"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder="Search company size..." />
                    <CommandList>
                      <CommandEmpty>Not found.</CommandEmpty>
                      <CommandGroup>
                        {companySizes.map((size) => (
                          <CommandItem
                            key={size.value}
                            onSelect={() => {
                              setSizeValue(size.value);
                              setFormData((prev) => ({
                                ...prev,
                                size: size.value,
                              }));
                              setSizeOpen(false);
                            }}
                            className="flex items-center"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 flex-shrink-0",
                                sizeValue === size.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <span className="truncate">{size.label}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="foundedYear">Founded Year</Label>
              <Input
                type="number"
                id="foundedYear"
                name="foundedYear"
                value={formData.foundedYear}
                onChange={handleChange}
                placeholder="2010"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.example.com"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of your company"
            />
          </div>

          <div>
            <Label>Headquarters</Label>
            <div className="grid grid-cols-3 gap-4">
              <Input
                type="text"
                name="headquarters.city"
                placeholder="City"
                value={formData.headquarters.city}
                onChange={handleChange}
              />
              <div>
                <Popover open={stateOpen} onOpenChange={setStateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={stateOpen}
                      className="w-full justify-between"
                    >
                      {formData.headquarters.state || "Select state"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Search state..." />
                      <CommandList>
                        <CommandEmpty>Not found.</CommandEmpty>
                        <CommandGroup>
                          {states.map((state) => (
                            <CommandItem
                              key={state.value}
                              onSelect={() => {
                                setStateValue(state.value);
                                setFormData((prev) => ({
                                  ...prev,
                                  headquarters: {
                                    ...prev.headquarters,
                                    state: state.value,
                                  },
                                }));
                                setStateOpen(false);
                              }}
                              className="flex items-center"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 flex-shrink-0",
                                  stateValue === state.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <span className="truncate">{state.label}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryOpen}
                      className="w-full justify-between truncate"
                    >
                      {countries.find(
                        (c) => c.code3 === formData.headquarters.country
                      )?.name || "Select country"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Search country..." />
                      <CommandList>
                        <CommandEmpty>Not found.</CommandEmpty>
                        <CommandGroup>
                          {countries.map((country) => (
                            <CommandItem
                              key={country.code3}
                              onSelect={() => {
                                setCountryValue(country.code3);
                                setFormData((prev) => ({
                                  ...prev,
                                  headquarters: {
                                    ...prev.headquarters,
                                    country: country.code3,
                                  },
                                }));
                                setCountryOpen(false);
                              }}
                              className="flex items-center"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 flex-shrink-0",
                                  countryValue === country.code3
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <span className="truncate">{country.name}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>{" "}
          </div>

          <div className="space-y-2">
            <Label>Social Media</Label>
            <div className="relative">
              <Linkedin
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                type="text"
                name="socialMedia.linkedin"
                placeholder="LinkedIn username"
                value={formData.socialMedia.linkedin}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Twitter
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                type="text"
                name="socialMedia.twitter"
                placeholder="Twitter username"
                value={formData.socialMedia.twitter}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Facebook
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                type="text"
                name="socialMedia.facebook"
                placeholder="Facebook username"
                value={formData.socialMedia.facebook}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit}>Save Profile</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
