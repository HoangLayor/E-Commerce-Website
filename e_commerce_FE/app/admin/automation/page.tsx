"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { 
  RefreshCw, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  FileText,
  Activity,
  UserCheck,
  Calendar,
  ListTodo,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Trash2
} from "lucide-react";
import { 
  fetchAutomationLogs, 
  triggerAutomationJob, 
  JobLog,
  adminFetchAiSuggestedOrders,
  adminBulkCancelOrders,
  adminFetchOrderRiskProfile,
  adminUpdateOrderStatus,
  OrderRiskProfileResponse
} from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

function LogItemRow({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [orderDetail, setOrderDetail] = useState<OrderRiskProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  const fetchDetail = async (id: number) => {
    if (!expanded) {
      setExpanded(true);
      if (!orderDetail) {
        setLoading(true);
        try {
          const data = await adminFetchOrderRiskProfile(id);
          setOrderDetail(data);
        } catch (e) {
          toast.error("Không thể tải chi tiết đơn hàng");
        } finally {
          setLoading(false);
        }
      }
    } else {
      setExpanded(false);
    }
  };

  const handleCancel = async (id: number) => {
    if(confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      try {
        await adminUpdateOrderStatus({ id, status: "CANCELLED" });
        toast.success("Đã hủy đơn hàng thành công và hoàn lại kho");
        setIsCancelled(true);
        setExpanded(false);
      } catch (e) {
        toast.error("Lỗi khi hủy đơn hàng");
      }
    }
  };

  // 1. Connection or Fatal Error
  if (text.includes("Lỗi kết nối AI") || text.includes("ERROR FATAL") || text.includes("Lỗi parse")) {
    return (
      <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-red-800 dark:text-red-300">LỖI KẾT NỐI / HỆ THỐNG AI</p>
          <p className="text-xs font-medium text-red-600 dark:text-red-400 leading-relaxed">{text}</p>
        </div>
      </div>
    );
  }

  // 2. AI Hủy (AI Cancelled)
  if (text.includes("AI YÊU CẦU HỦY")) {
    const match = text.match(/AI YÊU CẦU HỦY đơn (\d+):? (.*)/i);
    const orderId = match ? match[1] : "";
    const reason = match ? match[2] : text.replace(/AI YÊU CẦU HỦY đơn \d+:?/i, "").trim();
    return (
      <div className="flex gap-3 p-4 bg-rose-50/60 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/20 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30 shrink-0">
          <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-rose-900 dark:text-rose-300">AI ĐỀ XUẤT HỦY ĐƠN</span>
            {orderId && (
              <span className="text-xs bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-mono font-bold">
                Đơn #{orderId}
              </span>
            )}
          </div>
          <div className="bg-white/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-rose-100/50 dark:border-rose-900/20 mt-1">
            <p className="text-xs font-medium text-rose-700 dark:text-rose-300 leading-relaxed">
              <strong className="text-rose-900 dark:text-rose-200">Lý do hủy từ AI:</strong> {reason || "Phát hiện rủi ro bom hàng hoặc tài khoản bất thường."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Online Expired (Online Timeout)
  if (text.includes("Online quá hạn") || text.includes("Hủy đơn")) {
    const match = text.match(/Đã hủy đơn (\d+)/i);
    const orderId = match ? match[1] : "";
    return (
      <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
          <ShieldAlert className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-300">Hủy Đơn Chờ Thanh Toán</span>
            {orderId && (
              <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-mono font-bold">
                Đơn #{orderId}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Hết thời gian chờ thanh toán VNPAY (15 phút). Hệ thống đã tự động hủy đơn và hoàn trả sản phẩm lại kho.
          </p>
        </div>
      </div>
    );
  }

  // 4. AI Duyệt (AI Confirmed)
  if (text.includes("AI DUYỆT") || text.includes("DUYỆT đơn")) {
    const match = text.match(/AI DUYỆT đơn (\d+)/i);
    const orderId = match ? match[1] : "";
    return (
      <div className="flex gap-3 p-4 bg-emerald-50/60 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/20 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-emerald-900 dark:text-emerald-300">AI XÁC NHẬN AN TOÀN</span>
            {orderId && (
              <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
                Đơn #{orderId}
              </span>
            )}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
            Đơn hàng an toàn, không có dấu hiệu gian lận hoặc bất thường. Hệ thống tự động duyệt sang **Đang xử lý (PROCESSING)**.
          </p>
        </div>
      </div>
    );
  }

  // 5. Manual Review
  if (text.includes("MANUAL_REVIEW")) {
    const match = text.match(/AI YÊU CẦU MANUAL_REVIEW đơn (\d+):? (.*)/i);
    const orderId = match ? match[1] : "";
    const reason = match ? match[2] : text.replace(/.*MANUAL_REVIEW đơn \d+:?/i, "").trim();
    return (
      <div className={`flex flex-col gap-3 p-4 bg-amber-50/60 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-950/20 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm transition-all ${isCancelled ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        <div className="flex gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 shrink-0">
            <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-bold text-amber-900 dark:text-amber-300">CẦN DUYỆT THỦ CÔNG</span>
              {orderId && (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
                    Đơn #{orderId}
                  </span>
                  <button onClick={() => fetchDetail(Number(orderId))} className="text-xs flex items-center gap-1 bg-white dark:bg-slate-800 border border-border px-2 py-1 rounded-md hover:bg-slate-50 transition-colors">
                    {expanded ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                    Chi tiết
                  </button>
                  <Link href={`/admin/orders/${orderId}`} target="_blank" className="text-xs flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors">
                    <LinkIcon className="w-3 h-3"/>
                    Tới đơn
                  </Link>
                  <button onClick={() => handleCancel(Number(orderId))} disabled={isCancelled} className={`text-xs flex items-center gap-1 border px-2 py-1 rounded-md transition-colors ${isCancelled ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'}`}>
                    {isCancelled ? <CheckCircle className="w-3 h-3"/> : <Trash2 className="w-3 h-3"/>}
                    {isCancelled ? 'Đã hủy' : 'Hủy ngay'}
                  </button>
                </div>
              )}
            </div>
            <div className="bg-white/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-amber-100/50 dark:border-amber-900/20 mt-1">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300 leading-relaxed">
                <strong className="text-amber-900 dark:text-amber-200">Nhận định AI:</strong> {reason || "Có vài nghi vấn (Ví dụ: giá trị đơn lớn đột xuất). Yêu cầu CSKH kiểm tra thủ công."}
              </p>
            </div>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-2 pt-3 border-t border-amber-200/50 dark:border-amber-800/30 text-sm">
             {loading ? (
                <div className="flex items-center justify-center p-4"><Activity className="w-5 h-5 animate-spin text-amber-500" /></div>
             ) : orderDetail ? (
                <div className="flex flex-col gap-3 bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                  <h4 className="font-bold text-amber-800 dark:text-amber-200 border-b border-amber-100 dark:border-amber-900/30 pb-1 mb-1">1. Lịch sử người dùng</h4>
                  <ul className="list-disc list-inside text-xs space-y-1 ml-1 text-slate-700 dark:text-slate-300">
                    <li>Tuổi tài khoản: <b>{orderDetail.accountAgeDays}</b> ngày</li>
                    <li>Tổng đơn thành công: <b>{orderDetail.totalSuccessfulOrders}</b></li>
                    <li>Tổng đơn đã hủy: <b>{orderDetail.totalCancelledOrders}</b></li>
                    <li>Tổng đơn giao thất bại: <b>{orderDetail.totalFailedDeliveries}</b></li>
                    <li>Số đơn đặt trong 24h qua: <b>{orderDetail.ordersInLast24h}</b></li>
                  </ul>

                  <h4 className="font-bold text-amber-800 dark:text-amber-200 border-b border-amber-100 dark:border-amber-900/30 pb-1 mb-1">2. Chi tiết đơn hàng</h4>
                  <ul className="list-disc list-inside text-xs space-y-1 ml-1 text-slate-700 dark:text-slate-300">
                    <li>Tổng tiền: <b>{new Intl.NumberFormat("vi-VN").format(orderDetail.totalAmount)}đ</b></li>
                    <li>Phương thức thanh toán: <b>{orderDetail.paymentMethod}</b></li>
                    <li>Giờ đặt: <b>{new Date(orderDetail.orderTime).toLocaleString("vi-VN")}</b></li>
                    <li>Mã giảm giá: <b>{orderDetail.voucherCode || "Không có"}</b></li>
                  </ul>

                  <h4 className="font-bold text-amber-800 dark:text-amber-200 border-b border-amber-100 dark:border-amber-900/30 pb-1 mb-1">3. Thông tin giao hàng</h4>
                  <ul className="list-disc list-inside text-xs space-y-1 ml-1 text-slate-700 dark:text-slate-300">
                    <li>Người nhận: <b>{orderDetail.receiverName}</b></li>
                    <li>Số điện thoại: <b>{orderDetail.phone}</b></li>
                    <li>Địa chỉ: <b>{orderDetail.shippingAddress}</b></li>
                  </ul>

                  <h4 className="font-bold text-amber-800 dark:text-amber-200 border-b border-amber-100 dark:border-amber-900/30 pb-1 mb-1">4. Sản phẩm ({orderDetail.items.length})</h4>
                  <div className="space-y-1 pl-2">
                    {orderDetail.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-white/50 dark:bg-slate-800/50 p-2 rounded-md border border-amber-50 dark:border-amber-900/10">
                         <span className="truncate pr-2 font-medium">{item.productName}</span>
                         <span className="whitespace-nowrap text-amber-700 dark:text-amber-300 font-bold">x{item.quantity} (Giá: {new Intl.NumberFormat("vi-VN").format(item.price)}đ)</span>
                      </div>
                    ))}
                  </div>
                </div>
             ) : (
                <p className="text-xs text-red-500 text-center p-2">Không tìm thấy thông tin đơn hàng</p>
             )}
          </div>
        )}
      </div>
    );
  }

  // Default Fallback
  return (
    <div className="flex gap-3 p-4 bg-white dark:bg-slate-800/80 border border-border rounded-2xl animate-in fade-in duration-200 shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
        <FileText className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-0.5 flex-1">
        <p className="text-xs text-foreground font-mono leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function parseLogDetails(detailsStr: string): string[] {
  if (!detailsStr) return [];
  try {
    const parsed = JSON.parse(detailsStr);
    return Array.isArray(parsed) ? parsed : [detailsStr];
  } catch {
    return detailsStr.split("\n").filter(Boolean);
  }
}

export default function AutomationDashboard() {
  const [activeTab, setActiveTab] = useState<"logs" | "suggestions">("logs");
  
  const [logs, setLogs] = useState<JobLog[]>([]);
  const [suggestedOrders, setSuggestedOrders] = useState<OrderResponse[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());

  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [selectedLog, setSelectedLog] = useState<JobLog | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsData, suggestionsData] = await Promise.all([
        fetchAutomationLogs(),
        adminFetchAiSuggestedOrders()
      ]);
      setLogs(logsData);
      setSuggestedOrders(suggestionsData);
      
      if (logsData.length > 0 && !selectedLog) {
        setSelectedLog(logsData[0]);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Lỗi khi lấy dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTrigger = async () => {
    if (!confirm("Bạn có chắc chắn muốn chạy luồng duyệt đơn bằng AI ngay bây giờ?")) return;
    try {
      setTriggering(true);
      await triggerAutomationJob();
      toast.success("Chạy luồng tự động thành công!");
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error("Lỗi: " + (error.message || "Lỗi kết nối tới server"));
    } finally {
      setTriggering(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === suggestedOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(suggestedOrders.map(o => o.id)));
    }
  };

  const handleSelectOne = (id: number) => {
    const newSet = new Set(selectedOrders);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedOrders(newSet);
  };

  const handleBulkCancel = async () => {
    if (selectedOrders.size === 0) return;
    if (!confirm(`Bạn có chắc muốn HỦY ${selectedOrders.size} đơn hàng đã chọn theo đề xuất của AI? Hàng sẽ tự động được hoàn kho.`)) return;

    try {
      setLoading(true);
      await adminBulkCancelOrders(Array.from(selectedOrders));
      toast.success(`Đã hủy thành công ${selectedOrders.size} đơn hàng!`);
      setSelectedOrders(new Set());
      fetchData(); // reload
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi hủy đơn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase">
            <Activity className="w-4 h-4 animate-pulse" />
            AI Operation Center
          </div>
          <h1 className="text-4xl font-serif font-black tracking-tight text-foreground mt-1">
            Duyệt Đơn Hàng Tự Động
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-xl leading-relaxed">
            Hệ thống giám sát và phê duyệt tự động bằng trí tuệ nhân tạo Gemini AI. Quét rủi ro bom hàng, rác đơn và tự động xử lý.
          </p>
        </div>
        <div className="flex gap-3 self-start md:self-center">
          <button 
            onClick={fetchData} 
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold h-11 px-5 border border-border bg-card/60 backdrop-blur-md rounded-2xl hover:bg-muted hover:text-foreground transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <button 
            onClick={handleTrigger}
            disabled={triggering}
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold h-11 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/95 hover:to-primary/85 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 rounded-2xl transition-all duration-300 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            {triggering ? "Đang xử lý..." : "Kích hoạt Luồng AI"}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "logs" 
            ? "border-primary text-primary" 
            : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Lịch sử phiên chạy
        </button>
        <button
          onClick={() => setActiveTab("suggestions")}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "suggestions" 
            ? "border-rose-500 text-rose-600 dark:text-rose-400" 
            : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Đề xuất hủy chờ duyệt
          {suggestedOrders.length > 0 && (
            <span className="bg-rose-100 text-rose-600 text-xs px-2 py-0.5 rounded-full font-bold ml-1">
              {suggestedOrders.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "logs" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
          {/* Left column - Logs List */}
          <div className="lg:col-span-5 bg-card/40 backdrop-blur-md rounded-3xl border border-border/80 shadow-md overflow-hidden">
            <div className="p-5 border-b border-border/50 bg-card/80 flex items-center justify-between">
              <h2 className="font-serif font-bold text-lg text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Lịch sử các phiên chạy
              </h2>
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                {logs.length} Phiên
              </span>
            </div>
            <div className="divide-y divide-border/40 max-h-[600px] overflow-y-auto custom-scrollbar">
              {logs.map(log => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <div 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    className={`p-5 cursor-pointer transition-all duration-300 hover:bg-primary-light/5 ${
                      isSelected ? 'bg-primary-light/10 border-l-4 border-l-primary' : 'bg-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-xs font-bold text-muted-foreground font-mono">
                        #{log.id} — {format(new Date(log.startTime), "HH:mm:ss dd/MM/yyyy")}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-full ${
                        log.triggerType === 'AUTO' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
                      }`}>
                        {log.triggerType}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      Quét: {log.ordersProcessed} | <span className="text-rose-600 dark:text-rose-400">Đề xuất Hủy: {log.ordersCancelled}</span> | <span className="text-emerald-600 dark:text-emerald-400">Duyệt: {log.ordersConfirmed}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">
                        Thời lượng: {log.endTime ? `${Math.max(1, Math.round((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 1000))} giây` : "Đang chạy..."}
                      </span>
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full"><CheckCircle className="w-3.5 h-3.5"/> Thành công</span>
                      ) : log.status === 'RUNNING' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full"><Clock className="w-3.5 h-3.5 animate-spin"/> Đang chạy</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full"><XCircle className="w-3.5 h-3.5"/> Có lỗi</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {logs.length === 0 && !loading && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Không tìm thấy lịch sử chạy luồng tự động.
                </div>
              )}
            </div>
          </div>

          {/* Right column - Decision Details */}
          <div className="lg:col-span-7 bg-card/40 backdrop-blur-md rounded-3xl border border-border/80 shadow-md p-6 h-[660px] flex flex-col">
            <h2 className="font-serif font-bold text-xl text-foreground mb-6 flex items-center gap-2 border-b border-border/50 pb-4 shrink-0">
              <UserCheck className="w-5 h-5 text-primary" />
              Chi tiết phán quyết của AI
            </h2>
            
            {selectedLog ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Stats Summary Card */}
                <div className="grid grid-cols-3 gap-3 mb-6 shrink-0">
                  <div className="bg-card/80 p-3.5 rounded-2xl border border-border/50 shadow-sm text-center">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-1">Tổng đã quét</span>
                    <strong className="text-2xl font-black text-foreground">{selectedLog.ordersProcessed}</strong>
                  </div>
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-900/30 p-3.5 rounded-2xl shadow-sm text-center">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">AI Đã Duyệt</span>
                    <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{selectedLog.ordersConfirmed}</strong>
                  </div>
                  <div className="bg-rose-50/60 dark:bg-rose-950/10 border border-rose-100/30 dark:border-rose-900/30 p-3.5 rounded-2xl shadow-sm text-center">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-rose-600 dark:text-rose-400 block mb-1">AI Đề Xuất Hủy</span>
                    <strong className="text-2xl font-black text-rose-600 dark:text-rose-400">{selectedLog.ordersCancelled}</strong>
                  </div>
                </div>

                {/* Interactive Log Details List */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar min-h-0">
                  {selectedLog.details && parseLogDetails(selectedLog.details).length > 0 ? (
                    parseLogDetails(selectedLog.details).map((text, idx) => (
                      <LogItemRow key={idx} text={text} />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border/60 rounded-2xl text-muted-foreground h-44">
                      <FileText className="w-8 h-8 opacity-40 mb-2" />
                      <p className="text-sm">Không có dữ liệu log chi tiết cho phiên chạy này.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                <Activity className="w-12 h-12 opacity-25 mb-3 text-primary animate-pulse" />
                <p className="text-base font-medium">Chưa có phiên chạy nào được chọn</p>
                <p className="text-sm opacity-70 mt-1">Vui lòng chọn một lịch sử chạy bên trái để xem kết quả phán quyết chi tiết của AI.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-border/80 shadow-md p-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-6 border-b border-border/50 pb-4">
            <h2 className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-rose-500" />
              Danh sách đơn hàng AI đề xuất hủy
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Đã chọn <strong className="text-foreground">{selectedOrders.size}</strong> đơn
              </span>
              <button 
                onClick={handleBulkCancel}
                disabled={selectedOrders.size === 0 || loading}
                className="inline-flex items-center justify-center gap-2 text-sm font-bold h-10 px-5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Đồng ý Hủy Đơn ({selectedOrders.size})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          ) : suggestedOrders.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <CheckSquare className="w-16 h-16 text-emerald-400 mb-4 opacity-50" />
              <p className="text-lg font-medium text-foreground">Tuyệt vời!</p>
              <p className="text-muted-foreground mt-1">Hiện không có đơn hàng nào cần xác nhận hủy.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-sm font-semibold text-muted-foreground">
                    <th className="p-4 w-12 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedOrders.size === suggestedOrders.length && suggestedOrders.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-muted-foreground/30 text-rose-600 focus:ring-rose-500"
                      />
                    </th>
                    <th className="p-4">Mã Đơn</th>
                    <th className="p-4">Khách Hàng</th>
                    <th className="p-4">Lý Do Đề Xuất Hủy</th>
                    <th className="p-4 text-right">Tổng Tiền</th>
                    <th className="p-4 text-center">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-sm">
                  {suggestedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedOrders.has(order.id)}
                          onChange={() => handleSelectOne(order.id)}
                          className="w-4 h-4 rounded border-muted-foreground/30 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 font-mono font-bold text-foreground">
                        <Link href={`/admin/orders/${order.id}`} className="hover:text-primary hover:underline">
                          #{order.id}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-foreground">{order.receiverName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{order.phone}</div>
                      </td>
                      <td className="p-4 max-w-md">
                        <div className="text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 rounded-lg text-xs leading-relaxed inline-block">
                          {order.cancelReason || "AI nghi ngờ rủi ro gian lận."}
                        </div>
                      </td>
                      <td className="p-4 text-right font-bold text-foreground">
                        {formatCurrency(order.totalPrice || 0)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={async () => {
                            if (confirm(`Hủy đơn ${order.id} và hoàn kho?`)) {
                              setLoading(true);
                              await adminBulkCancelOrders([order.id]);
                              toast.success(`Đã hủy đơn ${order.id}`);
                              fetchData();
                            }
                          }}
                          className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/40 dark:hover:bg-rose-900/60 dark:text-rose-300 rounded-lg text-xs font-bold transition-colors"
                        >
                          Hủy Đơn
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); }
      `}</style>
    </div>
  );
}
