import { useState, useEffect } from "react";
import useStore from "@/app/state/useStore";
import {
  fetchPresets,
  updatePrimaryPreset,
} from "@/lib/collection/fetchPresets";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Info, Pencil, InfoIcon } from "lucide-react";
import CollectRightPanelEditor from "@/app/(auth)/dashboard/views/collection/right-panel-editor";
import { CollectRightPanelStart } from "@/app/(auth)/dashboard/views/collection/right-panel-help";
import { CollectionLoading } from "@/app/(auth)/dashboard/views/collection/loading";

interface Preset {
  title: string;
  primary: boolean;
  snippet_id: string;
}

enum PanelType {
  Intro = "intro",
  Benefits = "benefits",
}

export default function EmployerDashboardDocuments() {
  const { isExpanded, setExpanded, toggleExpansion, user } = useStore();

  const [fetching, setFetching] = useState(true);
  const [editingID, setEditingID] = useState<string | null>(null);
  const [presetIntro, setPresetIntro] = useState<Preset[]>([]);
  const [presetBenefits, setPresetBenefits] = useState<Preset[]>([]);
  const [panelType, setPanelType] = useState<PanelType | null>(null);
  const [addNew, setAddNew] = useState(false);

  // Load preset from store
  const getPresets = async () => {
    try {
      const owner = user?.uuid;
      if (!owner) {
        console.error("User UUID is null");
        return;
      }

      const presets = await fetchPresets(owner);
      console.log(presets);

      // Assuming presets is an object with 'intro' and 'benefits' arrays
      setPresetIntro(presets.intro || []);
      setPresetBenefits(presets.benefits || []);
      setFetching(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getPresets();
  }, []); // Empty dependency array ensures this runs once on component load

  const handlePrimaryChange = async (
    type: "intro" | "benefits",
    snippet_id: string
  ) => {
    try {
      const owner = user?.uuid;
      await updatePrimaryPreset(owner!, type, snippet_id);

      // Update the state directly
      if (type === "intro") {
        setPresetIntro((prevState) =>
          prevState.map((intro) => ({
            ...intro,
            primary: intro.snippet_id === snippet_id,
          }))
        );
      } else {
        setPresetBenefits((prevState) =>
          prevState.map((benefit) => ({
            ...benefit,
            primary: benefit.snippet_id === snippet_id,
          }))
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  // onclick handle withn user clicks pencil icon. Add the snippet_id to the state
  const handleEdit = (snippet_id: string) => {
    setEditingID(snippet_id);
    setExpanded(false);
    setAddNew(false);
    console.log(snippet_id);
  };

  // onClick handler for create new button
  const handleCreateNew = (type: PanelType) => {
    setPanelType(type);
    setAddNew(true);
    setExpanded(false);
    setEditingID("new");
    console.log(type);
  };

  // Controller for right panel content
  const RightPanelContent = editingID ? (
    <CollectRightPanelEditor
      editingID={editingID}
      userID={user?.uuid}
      setEditingID={setEditingID}
      type={addNew && panelType ? panelType : undefined} // If addNew is true, pass the panelType
      addNew={addNew}
      onUpdate={getPresets}
    />
  ) : (
    <CollectRightPanelStart />
  );

  return (
    <main className="flex flex-1 gap-4 p-4 max-h-screen overflow-auto h-screen">
      <div
        className={`flex flex-col gap-4 transition-all duration-700 ease-in-out w-full md:w-full ${
          isExpanded ? "lg:w-3/4" : "lg:w-1/2"
        }`}
      >
        <div className="flex justify-between gap-6 rounded-lg border p-4">
          <h2 className="font-bold leading-6 text-gray-900">Collection</h2>
        </div>
        <div className="flex flex-col gap-6">
          {fetching ? (
            <CollectionLoading />
          ) : (
            <>
              <div className="rounded-lg border p-4">
                <div className="flex flex-col gap-4">
                  <h2 className="text-sm font-bold">Company Introduction</h2>
                  <div className="grid md:grid-cols-1 lg:grid-cols-2 text-sm gap-4">
                    <div
                      onClick={() => {
                        if (!editingID) {
                          handleCreateNew(PanelType.Intro);
                        }
                      }}
                      className={`rounded-md border p-4 flex flex-row justify-between items-center transition-all duration-300 ease-in-out border-1 ${
                        editingID
                          ? "cursor-default opacity-50"
                          : "cursor-pointer border-gray-200 hover:border-2 hover:border-gray-800"
                      }`}
                    >
                      <div className="flex flex-row gap-2 items-center">
                        <span className="font-medium text-md text-gray-800">
                          Create new
                        </span>
                      </div>
                    </div>
                    {presetIntro &&
                      presetIntro.map((intro) => (
                        <div
                          key={intro.snippet_id}
                          className={`rounded-md border p-4 flex flex-row justify-between items-center transition-all duration-300 ease-in-out ${
                            intro.snippet_id === editingID
                              ? "border-2 border-slate-800"
                              : "border-1 border-gray-200"
                          } ${
                            editingID && intro.snippet_id !== editingID
                              ? "opacity-50 pointer-events-none"
                              : ""
                          }`}
                        >
                          <div className="flex flex-row gap-2 items-center">
                            <div
                              onClick={() => {
                                if (editingID !== intro.snippet_id) {
                                  handleEdit(intro.snippet_id);
                                }
                              }}
                              className={`cursor-pointer p-2 rounded-full bg-gray-50 hover:bg-gray-200 transition-colors duration-300 ease-in-out ${
                                editingID && intro.snippet_id !== editingID
                                  ? "cursor-default"
                                  : ""
                              }`}
                            >
                              <Pencil size={12} className="text-gray-800" />
                            </div>
                            <span className="font-medium text-md text-gray-800">
                              {intro.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label
                              className="text-xs font-light"
                              htmlFor={`intro-switch-${intro.snippet_id}`}
                            >
                              Primary
                            </Label>
                            <Switch
                              id={`intro-switch-${intro.snippet_id}`}
                              checked={intro.primary}
                              onCheckedChange={() =>
                                handlePrimaryChange("intro", intro.snippet_id)
                              }
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex flex-col gap-4">
                  <h2 className="text-sm font-bold">Benefits</h2>
                  <div className="grid md:grid-cols-1 lg:grid-cols-2 text-sm gap-4">
                    <div
                      onClick={() => {
                        if (!editingID) {
                          handleCreateNew(PanelType.Benefits);
                        }
                      }}
                      className={`rounded-md border p-4 flex flex-row justify-between items-center transition-all duration-300 ease-in-out border-1 ${
                        editingID
                          ? "cursor-default opacity-50"
                          : "cursor-pointer border-gray-200 hover:border-2 hover:border-gray-800"
                      }`}
                    >
                      <div className="flex flex-row gap-2 items-center">
                        <span className="font-medium text-md text-gray-800">
                          Create new
                        </span>
                      </div>
                    </div>
                    {presetBenefits &&
                      presetBenefits.map((benefit) => (
                        <div
                          key={benefit.snippet_id}
                          className={`rounded-md border p-4 flex flex-row justify-between items-center transition-all duration-300 ease-in-out ${
                            benefit.snippet_id === editingID
                              ? "border-2 border-slate-800"
                              : "border-1 border-gray-200"
                          } ${
                            editingID && benefit.snippet_id !== editingID
                              ? "opacity-50 pointer-events-none"
                              : ""
                          }`}
                        >
                          <div className="flex flex-row gap-2 items-center">
                            <div
                              onClick={() => {
                                if (editingID !== benefit.snippet_id) {
                                  handleEdit(benefit.snippet_id);
                                }
                              }}
                              className={`cursor-pointer p-2 rounded-full bg-gray-50 hover:bg-gray-200 transition-colors duration-300 ease-in-out ${
                                editingID && benefit.snippet_id !== editingID
                                  ? "cursor-default"
                                  : ""
                              }`}
                            >
                              <Pencil size={12} className="text-gray-800" />
                            </div>
                            <span className="font-medium text-md text-gray-800">
                              {benefit.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Label
                              className="text-xs font-light"
                              htmlFor={`benefit-switch-${benefit.snippet_id}`}
                            >
                              Primary
                            </Label>
                            <Switch
                              id={`benefit-switch-${benefit.snippet_id}`}
                              checked={benefit.primary}
                              onCheckedChange={() =>
                                handlePrimaryChange(
                                  "benefits",
                                  benefit.snippet_id
                                )
                              }
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-4 rounded-lg border px-4 py-2 text-xs">
          <InfoIcon className="h-4 w-4" />{" "}
          <p>Collections are not shared with other users of your organization</p>
        </div>
      </div>

      <div
        className={`hidden md:flex flex-col gap-4 transition-all duration-700 ease-in-out ${
          isExpanded ? "lg:w-1/4" : "lg:w-1/2"
        }`}
      >
        <div className="min-h-[90vh] rounded-xl bg-muted/50 p-4 overflow-auto">
          {RightPanelContent}
        </div>
      </div>
    </main>
  );
}
