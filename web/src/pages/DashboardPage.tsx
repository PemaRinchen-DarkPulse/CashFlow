import React from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function ProviderDashboard() {
  return (
    <>
      <h1 className="text-xl font-bold text-neutral-900 mb-6">
        Hello, Dr. Dorji
      </h1>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="border-neutral-200 rounded-xl">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
              Consultations Today
            </p>
            <div className="flex items-baseline">
              <h2 className="text-3xl font-bold text-neutral-900">22</h2>
            </div>
            <p className="text-xs text-red-500 mt-2 font-medium">
              -12% vs yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 rounded-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
                  CPD Progress
                </p>
                <div className="flex items-baseline">
                  <h2 className="text-3xl font-bold text-neutral-900">47%</h2>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Active Modules: 19
                </p>
              </div>
              <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-600 flex items-center justify-center">
                {/* Ring placeholder */}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 rounded-xl">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
              Active Referrals
            </p>
            <div className="flex items-baseline">
              <h2 className="text-3xl font-bold text-neutral-900">6</h2>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Pending acceptance at JDWNRH
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column: Urgent Alerts (Replacing Appraisals) */}
        <Card className="border-neutral-200 rounded-xl col-span-1 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold">Urgent Alerts</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="h-10 px-2 align-middle font-medium text-neutral-500">
                      Alert Type
                    </th>
                    <th className="h-10 px-2 align-middle font-medium text-neutral-500">
                      Patient
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-50">
                    <td className="p-2 align-middle text-red-600 font-medium">
                      Abnormal Vitals
                    </td>
                    <td className="p-2 align-middle">Sangay Wangmo</td>
                  </tr>
                  <tr className="border-b border-neutral-50">
                    <td className="p-2 align-middle text-orange-600 font-medium">
                      Drug Interaction
                    </td>
                    <td className="p-2 align-middle">Karma Tenzin</td>
                  </tr>
                  <tr className="border-b border-neutral-50">
                    <td className="p-2 align-middle text-blue-600 font-medium">
                      Teleconsult Req
                    </td>
                    <td className="p-2 align-middle">Lhuntse BHU</td>
                  </tr>
                  <tr className="border-b border-neutral-50">
                    <td className="p-2 align-middle text-neutral-700 font-medium">
                      Missed ANC
                    </td>
                    <td className="p-2 align-middle">Dechen Lhamo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Queue (Replacing Timetable) */}
        <Card className="border-neutral-200 rounded-xl col-span-1 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-base font-bold">
                Today's Queue
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-neutral-200 text-xs"
                >
                  All Facilities <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-neutral-200 text-xs"
                >
                  All Conditions <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
                <div className="flex items-center border border-neutral-200 rounded-md ms-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none rounded-l-md"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-medium px-3 bg-white">
                    April 27, 2026
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none rounded-r-md"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="h-10 px-4 align-middle font-medium text-neutral-500">
                      Time
                    </th>
                    <th className="h-10 px-4 align-middle font-medium text-neutral-500">
                      Patient Type
                    </th>
                    <th className="h-10 px-4 align-middle font-medium text-neutral-500">
                      Condition / Reason
                    </th>
                    <th className="h-10 px-4 align-middle font-medium text-neutral-500 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-50 hover:bg-neutral-50/50">
                    <td className="p-4 align-middle font-medium">
                      10:00 - 10:15
                    </td>
                    <td className="p-4 align-middle">Walk-in</td>
                    <td className="p-4 align-middle">Hypertension Follow-up</td>
                    <td className="p-4 align-middle text-right">
                      <a
                        href="#"
                        className="text-blue-600 font-medium hover:underline"
                      >
                        Start Consultation
                      </a>
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-50 hover:bg-neutral-50/50">
                    <td className="p-4 align-middle font-medium">
                      10:30 - 11:00
                    </td>
                    <td className="p-4 align-middle">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 text-xs py-0"
                      >
                        Teleconsult
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      Respiratory Infection (Gasa BHU)
                    </td>
                    <td className="p-4 align-middle text-right">
                      <a
                        href="#"
                        className="text-blue-600 font-medium hover:underline"
                      >
                        Join Video
                      </a>
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-50 hover:bg-neutral-50/50">
                    <td className="p-4 align-middle font-medium">
                      11:15 - 11:30
                    </td>
                    <td className="p-4 align-middle">Follow-up</td>
                    <td className="p-4 align-middle">Review Lab Results</td>
                    <td className="p-4 align-middle text-right">
                      <a
                        href="#"
                        className="text-blue-600 font-medium hover:underline"
                      >
                        Review Charts
                      </a>
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-50 hover:bg-neutral-50/50">
                    <td className="p-4 align-middle font-medium">
                      13:00 - 13:45
                    </td>
                    <td className="p-4 align-middle">
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200 text-xs py-0"
                      >
                        Emergency
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      Suspected Malaria (Gelephu)
                    </td>
                    <td className="p-4 align-middle text-right">
                      <a
                        href="#"
                        className="text-blue-600 font-medium hover:underline"
                      >
                        View AI Triage
                      </a>
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-50 hover:bg-neutral-50/50">
                    <td className="p-4 align-middle font-medium">
                      14:00 - 14:15
                    </td>
                    <td className="p-4 align-middle">Walk-in</td>
                    <td className="p-4 align-middle">
                      Sowa Rigpa Consultation
                    </td>
                    <td className="p-4 align-middle text-right">
                      <a
                        href="#"
                        className="text-blue-600 font-medium hover:underline"
                      >
                        Start Consultation
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bottom Areas */}
        <Card className="border-neutral-200 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold">Referral Log</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-neutral-200 text-xs"
            >
              Recent <ChevronDown className="ml-2 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="py-6 flex items-center justify-center text-neutral-400 text-xs">
            [Referral tracking details shown here]
          </CardContent>
        </Card>
        <Card className="border-neutral-200 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold">
              NCD Module Progress
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="py-6 flex items-center justify-center text-neutral-400 text-xs">
            [Patient adherence and BP trends shown here]
          </CardContent>
        </Card>
      </div>
    </>
  );
}
