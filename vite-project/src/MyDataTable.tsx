import * as React from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "./components/ui/checkbox";

import DataTable from "react-data-table-component";

export default function MyDataTable() {
  const stateSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(3),
    framework: z.enum(["next", "sveltekit", "astro", "nuxt"]),
    gender: z.union([z.literal("male"), z.literal("female"), z.literal("")]).refine((val) => val !== ""),
    hobbies: z.object({
      hobby1: z.boolean(),
      hobby2: z.boolean(),
    }),
  });

  const [state, setState] = React.useState<z.infer<typeof stateSchema>>({
    id: 1,
    name: "",
    framework: "next",
    gender: "",
    hobbies: {
      hobby1: false,
      hobby2: false,
    },
  });
  const [data, setData] = React.useState<(typeof state)[]>([]);
  const [errors, setErrors] = React.useState({
    name: false,
    framework: false,
    gender: false
  });
  const [editFlag, setEditFlag] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);

  React.useEffect(() => {
    const result = stateSchema.safeParse(state);
    if (result.success) {
      setErrors({
        name: false,
        framework: false,
        gender: false
      });
    }
  }, [state]);

  const handleSubmit = () => {
    const result = stateSchema.safeParse(state);
    if (result.success) {
      if (!editFlag) {
        setData(() => data.concat(result.data));
        setState({
          id: state.id + 1,
          name: "",
          framework: "next",
          gender: "",
          hobbies: {
            hobby1: false,
            hobby2: false,
          },
        });
      } else {
        const updatedEntry = {
          id: result.data.id,
          name: state.name,
          framework: state.framework,
          gender: state.gender,
          hobbies: state.hobbies,
        };
        const updatedTable = data.map((item) =>
          item.id === editId ? updatedEntry : item
        );
        setData(updatedTable);
        setEditFlag(false);
        setEditId(null);
      }
    } else {
      const fieldErrors = result.error.format();
      setErrors({
        name: fieldErrors.name?._errors[0] ? true : false,
        framework: fieldErrors.framework?._errors[0] ? true : false,
        gender: fieldErrors.gender?._errors[0] ? true : false
      });
    }
  };

  const columns = [
    {
      name: "Name",
      selector: (row: typeof state) => row.name,
      minWidth: "40px",
      sortable: true,
    },
    {
      name: "Framework",
      selector: (row: typeof state) => row.framework,
      minWidth: "125px",
      sortable: true,
    },
    {
      name: "Gender",
      selector: (row: typeof state) => row.gender,
      sortable: true,
    },
    {
      name: "Hobbies",
      minWidth: "200px",
      cell: (row: typeof state) =>
        Object.entries(row.hobbies)
          .filter(([, value]) => value)
          .map(([key]) => <span className="mr-2">{key}</span>),
    },
    {
      name: "Actions",
      minWidth: "200px",
      cell: (row: typeof state) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setState({
                id: row.id,
                name: row.name,
                framework: row.framework,
                gender: row.gender,
                hobbies: row.hobbies,
              });
              setEditFlag(true);
              setEditId(data.find((item) => item.id === row.id)?.id || null);
            }}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setData((prev) => prev.filter((item) => item.id !== row.id));
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
      <Card className="w-sm">
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>
            Deploy your new project in one-click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Name of your project"
                  value={state.name}
                  onChange={(e) =>
                    setState({
                      ...state,
                      name: e.target.value,
                    })
                  }
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">
                    Name must be at least 4 characters long.
                  </p>
                )}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="framework">Framework</Label>
                <Select
                  value={state.framework}
                  onValueChange={(
                    val: "next" | "sveltekit" | "astro" | "nuxt"
                  ) =>
                    setState({
                      ...state,
                      framework: val,
                    })
                  }
                >
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="next">Next.js</SelectItem>
                    <SelectItem value="sveltekit">SvelteKit</SelectItem>
                    <SelectItem value="astro">Astro</SelectItem>
                    <SelectItem value="nuxt">Nuxt.js</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="gender">Gender</Label>
                <RadioGroup
                  className="flex"
                  value={state.gender}
                  onValueChange={(val) => {
                    setState({
                      ...state,
                      gender: val as "male" | "female",
                    });
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="r1" />
                    <Label htmlFor="r1">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="r2" />
                    <Label htmlFor="r2">Female</Label>
                  </div>
                </RadioGroup>
                {errors.gender && (
                  <p className="text-sm text-red-500">
                    must specify a gender
                  </p>
                )}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="hobby">Hobbies</Label>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={state.hobbies.hobby1}
                      id="hobby1"
                      onCheckedChange={(checked) => {
                        console.log("male");
                        setState({
                          ...state,
                          hobbies: {
                            ...state.hobbies,
                            hobby1: checked as boolean,
                          },
                        });
                      }}
                    />
                    <Label htmlFor="hobby1">Hobby 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={state.hobbies.hobby2}
                      id="hobby2"
                      onCheckedChange={(checked) => {
                        console.log("female");
                        setState({
                          ...state,
                          hobbies: {
                            ...state.hobbies,
                            hobby2: checked as boolean,
                          },
                        });
                      }}
                    />
                    <Label htmlFor="hobby2">Hobby 2</Label>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSubmit}>Deploy</Button>
        </CardFooter>
      </Card>
      <div className="p-4">
        <DataTable
          columns={columns}
          data={data}
          pagination
          paginationPerPage={10}
        />
      </div>
    </div>
  );
}
