"use client";
import Image from "next/image";
import Logo from "@/public/global/logo_mono_dark.png";
import { Dialog } from "@headlessui/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  PhoneIcon,
  PlayCircleIcon,
} from "@heroicons/react/20/solid";
import {
  ChartPieIcon,
  FolderOpenIcon,
  NewspaperIcon,
  ChartBarSquareIcon,
  UserGroupIcon,
  BellAlertIcon,
  HeartIcon,
  SquaresPlusIcon,
  LightBulbIcon,
  UsersIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  LifebuoyIcon,
} from "@heroicons/react/24/outline";
import { ModeToggle } from "@/components/modeToggle";

// Define the type for a category item
type CategoryItem = {
  name: string;
  description: string;
  href: string;
  icon: React.ElementType;
};

// Define the type for a category
type Category = {
  id: number;
  type: string;
  category: string;
  callsToAction?: { name: string; href: string; icon: React.ElementType }[];
  items?: CategoryItem[];
  href?: string;
};

// Define the type for a navigation item
type NavigationItem = {
  name: string;
  href: string;
};

// Define the type for the CategoryMenu component
type CategoryMenuProps = {
  category: Category;
};

// Define the type for the item parameter
type ItemProps = {
  item: CategoryItem;
};

// Define the type for the action parameter
type ActionProps = {
  actions: { name: string; href: string; icon: React.ElementType }[];
};

// Define the complete categories array
const categories: Category[] = [
  {
    id: 1,
    type: "menu",
    category: "For Candidates",
   /*  callsToAction: [
      { name: "Watch demo", href: "/#experience-demo", icon: PlayCircleIcon },
      { name: "Contact sales", href: "/contact-us", icon: PhoneIcon },
    ], */
    items: [
      {
        name: "Alpha...Details",
        description:
          "Alpha",
        href: "/",
        icon: HeartIcon,
      },
    ],
  },
  {
    id: 2,
    type: "menu",
    category: "For Employers",
    callsToAction: [],
    items: [
      {
        name: "Alpha...Details",
        description:
          "Alpha",
        href: "/employers",
        icon: BellAlertIcon,
      },
      // Add other platform items...
    ],
  },
];

const ActionItems: React.FC<ActionProps> = ({ actions }) => {
  return (
    <>
      {actions.map((action, index) => (
        <a
          key={action.name}
          href={action.href}
          className="-mx-3 rounded-lg px-3 py-2 hidden lg:inline text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
        >
          <action.icon
            className="h-5 w-5 mr-2 text-gray-500"
            aria-hidden="true"
          />
          {action.name}
        </a>
      ))}
    </>
  );
};

export function MainHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPodcastDialogOpen, setIsPodcastDialogOpen] = useState(false);

  // Render menu
  const CategoryMenu: React.FC<CategoryMenuProps> = ({ category }) => {
    // Render for direct link type
    if (category.type === "link") {
      return (
        <a
          href={category.href}
          className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-gray-700"
        >
          {category.category}
        </a>
      );
    }

    // Render for menu type
    return (
      <Popover className="relative">
        <Popover.Button className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900">
          <span>{category.category}</span>
          <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
        </Popover.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel className="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4">
            <div className="w-screen max-w-md overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
              {category.items?.map((item, index) => (
                <div
                  key={item.name}
                  className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                    <item.icon
                      className="h-6 w-6 text-g2x-600 group-hover:text-g2x-300"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <a
                      href={item.href}
                      className="font-semibold text-gray-900 cursor-pointer"
                    >
                      {item.name}
                    </a>
                    <p className="mt-1 text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
              {category.callsToAction &&
                (category.callsToAction?.length ?? 0) > 0 && (
                  <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                    {category.callsToAction.map((action, index) => (
                      <a
                        key={action.name}
                        href={action.href}
                        className="flex items-center justify-center gap-x-2.5 p-3 font-semibold text-gray-900 hover:bg-gray-100"
                      >
                        <action.icon
                          className="h-5 w-5 flex-none text-gray-400"
                          aria-hidden="true"
                        />
                        {action.name}
                      </a>
                    ))}
                  </div>
                )}
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    );
  };

  return (
    <header className="relative inset-x-0 top-0 z-50 mt-6">
      <nav
        className="flex items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <Image src={Logo} alt="G2X" width={128} height={41} />
          </a>
        </div>
        <div className="flex md:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden md:flex space-x-6">
          {categories.map((category) => (
            <CategoryMenu key={category.id} category={category} />
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <a
            href="/dashboard"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Log in <span aria-hidden="true">&rarr;</span>
          </a>
         {/*  <ModeToggle /> */}
        </div>
      </nav>
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">G2X</span>
              <Image src={Logo} alt="G2X" width={128} height={41} />
            </a>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="py-6">
                {categories
                  .filter((category) => category.id !== 3)
                  .map((category) =>
                    category.type === "link" ? (
                      <a
                        key={category.id}
                        href={category.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-g2x-700 hover:bg-gray-50"
                      >
                        {category.category}
                      </a>
                    ) : (
                      <div key={category.id} className="pb-4">
                        <h3 className="text-xl font-semibold">
                          {category.category}
                        </h3>
                        {category.items?.map((item, i) => (
                          <a
                            key={i}
                            href={item.href}
                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-700 hover:bg-gray-50"
                          >
                            {item.name}
                          </a>
                        ))}
                        {category.callsToAction && (
                          <ActionItems actions={category.callsToAction} />
                        )}
                      </div>
                    )
                  )}
              </div>
              <div className="py-6">
                <a
                  href="/pricing"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Pricing
                </a>
                <a
                  href="/dashboard"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Log in
                </a>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
