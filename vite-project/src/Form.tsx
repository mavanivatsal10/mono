import * as React from "react";

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

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function Form() {
  const [name, setName] = React.useState("");
  const [framework, setFramework] = React.useState("next");
  const [gender, setGender] = React.useState("male");
  const [hobbies, setHobbies] = React.useState({
    hobby1: false,
    hobby2: false,
  });
  const [table, setTable] = React.useState<
    {
      name: string;
      framework: string;
      gender: string;
      hobbies: { hobby1: boolean; hobby2: boolean };
    }[]
  >([]);
  const [errors, setErrors] = React.useState({
    name: false,
    framework: false,
  });
  const [editFlag, setEditFlag] = React.useState(false);
  const [editIndex, setEditIndex] = React.useState(-1);

  const handleSubmit = () => {
    if (!editFlag) {
    if (name.length > 3) {
      setErrors({
        name: false,
        framework: false,
      });
      setTable(() =>
        table.concat({
          name,
          framework,
          gender,
          hobbies,
        })
      );
    } else {
      setErrors({ ...errors, name: true });
    }} else {
      const updatedTable = [...table];
      updatedTable[editIndex] = {
        name,
        framework,
        gender,
        hobbies,
      };
      setTable(updatedTable);
      setEditFlag(false);
      setEditIndex(-1);
    }
  };

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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                  />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="framework">Framework</Label>
                <Select
                  value={framework}
                  onValueChange={(val) => setFramework(val)}
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
                  defaultValue="male"
                  className="flex"
                  value={gender}
                  onValueChange={setGender}
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
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="hobby">Hobbies</Label>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={hobbies.hobby1}
                      id="hobby1"
                      onCheckedChange={(checked) =>
                        setHobbies({ ...hobbies, hobby1: checked as boolean })
                      }
                    />
                    <Label htmlFor="hobby1">Hobby 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={hobbies.hobby2}
                      id="hobby2"
                      onCheckedChange={(checked) =>
                        setHobbies({ ...hobbies, hobby2: checked as boolean })
                      }
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
        <Table>
          <TableCaption></TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Framework</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Hobbies</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.map((row, index) => (
              <TableRow key={row.name}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.framework}</TableCell>
                <TableCell>{row.gender}</TableCell>
                <TableCell>
                  {Object.entries(row.hobbies)
                    .filter(([, value]) => value)
                    .map(([key]) => (
                      <span>{key}, </span>
                    ))}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setName(row.name);
                      setFramework(row.framework);
                      setGender(row.gender);
                      setHobbies(row.hobbies);
                      setEditFlag(true);
                      setEditIndex(index);
                    }}
                  >
                    Edit
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setTable((prev) =>
                        prev.filter((item) => item.name !== row.name)
                      );
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
