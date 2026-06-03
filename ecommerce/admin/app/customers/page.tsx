"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MoreHorizontal, Eye, Mail, UserX, UserCheck, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminFetchUsers, adminToggleUserStatus, type BackendUser } from "@/lib/api";
import { toast } from "sonner";

const tierColors: Record<string, string> = {
  Bronze: "bg-amber-100 text-amber-800",
  Silver: "bg-slate-100 text-slate-800",
  Gold: "bg-yellow-100 text-yellow-800",
  Platinum: "bg-purple-100 text-purple-800",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

function getInitials(name: string) {
  return name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";
}

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminFetchUsers();
      setUsers(data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: BackendUser) => {
    try {
      await adminToggleUserStatus(user.id, !user.isActive);
      toast.success(user.isActive ? "Vô hiệu hóa thành công" : "Kích hoạt thành công");
      loadUsers();
    } catch (error) {
      toast.error("Thao tác thất bại");
    }
  };

  const filteredCustomers = (users || []).filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Khách hàng
        </h1>
        <p className="text-muted-foreground">
          Quản lý thông tin khách hàng và cấp bậc thành viên
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-sm text-muted-foreground">Tổng khách hàng</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">
              {users.filter((u) => u.isActive).length}
            </p>
            <p className="text-sm text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">
              {formatCurrency(users.length > 0 ? users.reduce((acc, u) => acc + (u.totalSpent || 0), 0) / users.length : 0)}
            </p>
            <p className="text-sm text-muted-foreground">
              Chi tiêu trung bình
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">
              {(users.length > 0 ? users.reduce((acc, u) => acc + (u.orderCount || 0), 0) / users.length : 0).toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground">
              Đơn hàng trung bình
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, email hoặc SĐT..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Đơn hàng</TableHead>
                  <TableHead>Tổng chi tiêu</TableHead>
                  <TableHead>Cấp bậc</TableHead>
                  <TableHead>Ngày tham gia</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      Không tìm thấy khách hàng nào.
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary-light text-primary">
                            {getInitials(customer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{customer.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.phone || "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{customer.orderCount || 0}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(customer.totalSpent || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge className={customer.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {customer.isActive ? "Hoạt động" : "Bị khóa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("vi-VN") : "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/customers/${customer.id}`} className="flex items-center cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Gửi email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className={customer.isActive ? "text-destructive" : "text-green-600"}
                            onClick={() => handleToggleStatus(customer)}
                          >
                            {customer.isActive ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Vô hiệu hóa
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Kích hoạt
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                Không tìm thấy khách hàng nào
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
