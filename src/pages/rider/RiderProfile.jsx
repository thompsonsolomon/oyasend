import { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";

/*
|--------------------------------------------------------------------------
| CLOUDINARY
|--------------------------------------------------------------------------
*/

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",

  vehicleType: "",
  vehicleModel: "",
  vehiclePlateNumber: "",
  vehicleColor: "",

  deliveryArea: "",
  maxDistance: "",
  autoAccept: false,

  newOrders: true,
  orderUpdates: true,
  paymentNotifications: true,
  promotions: false,
  systemAnnouncements: true,

  bankName: "",
  accountName: "",
  accountNumber: "",

  verificationStatus: "not_submitted",
};

const DOCUMENT_TYPES = [
  {
    value: "government_id",
    label: "Government ID",
  },
  {
    value: "drivers_license",
    label: "Driver's License",
  },
  {
    value: "vehicle_registration",
    label: "Vehicle Registration",
  },
];

const STATUS_CONFIG = {
  verified: {
    label: "Verified",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  pending: {
    label: "Under Review",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  rejected: {
    label: "Action Required",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  not_submitted: {
    label: "Not Submitted",
    className: "bg-gray-50 text-gray-600 border-gray-200",
  },
};

function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);

  if (!parts.length) return "OY";

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatMoney(value = 0) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function formatDate(value) {
  if (!value) return "—";

  try {
    if (value?.toDate) {
      return value.toDate().toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    return new Date(value).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

async function uploadToCloudinary(file, folder = "oyasend/riders") {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file."
    );
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Cloudinary upload failed.");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
  };
}

/*
|--------------------------------------------------------------------------
| SMALL UI COMPONENTS
|--------------------------------------------------------------------------
*/

function SectionCard({ icon, title, description, children, action }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF5EF] text-[#087443]">
            {icon}
          </div>

          <div>
            <h2 className="font-semibold text-[#061A14]">{title}</h2>

            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>

        {action}
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#087443] focus:ring-2 focus:ring-[#087443]/10 disabled:bg-gray-50 disabled:text-gray-500"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <select
        value={value ?? ""}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#087443] focus:ring-2 focus:ring-[#087443]/10"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-gray-100 p-4 text-left transition hover:bg-gray-50"
    >
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>

        {description && (
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        )}
      </div>

      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-[#087443]" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_submitted;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

export default function RiderProfile() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [user, setUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [photoURL, setPhotoURL] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [documentUploading, setDocumentUploading] = useState(false);

  const [selectedDocumentType, setSelectedDocumentType] =
    useState("government_id");

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    earnings: 0,
  });

  const [isAvailable, setIsAvailable] = useState(false);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | FETCH RIDER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        navigate("/login");
        return;
      }

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("Rider profile was not found.");
      }

      const data = userSnap.data();

      if (data.role !== "rider") {
        throw new Error("This account is not registered as a rider.");
      }

      setUser({
        uid: currentUser.uid,
        ...data,
      });

      setPhotoURL(data.photoURL || data.photoUrl || "");

      setIsAvailable(Boolean(data.isAvailable));

      setForm({
        ...EMPTY_FORM,

        name: data.name || data.fullName || "",
        phone: data.phone || "",
        email: data.email || currentUser.email || "",

        vehicleType: data.vehicle?.type || data.vehicleType || "",
        vehicleModel: data.vehicle?.model || data.vehicleModel || "",
        vehiclePlateNumber:
          data.vehicle?.plateNumber || data.vehiclePlateNumber || "",
        vehicleColor: data.vehicle?.color || data.vehicleColor || "",

        deliveryArea: data.preferences?.deliveryArea || "",
        maxDistance: data.preferences?.maxDistance || "",
        autoAccept: Boolean(data.preferences?.autoAccept),

        newOrders: data.notifications?.newOrders !== false,
        orderUpdates: data.notifications?.orderUpdates !== false,
        paymentNotifications:
          data.notifications?.paymentNotifications !== false,
        promotions: Boolean(data.notifications?.promotions),
        systemAnnouncements:
          data.notifications?.systemAnnouncements !== false,

        bankName: data.payment?.bankName || "",
        accountName: data.payment?.accountName || "",
        accountNumber: data.payment?.accountNumber || "",

        verificationStatus:
          data.verification?.status || data.verificationStatus || "not_submitted",
      });

      await Promise.all([
        loadDocuments(currentUser.uid),
        loadOrderStats(currentUser.uid),
      ]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load rider profile.");
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD DOCUMENTS
  |--------------------------------------------------------------------------
  */

  async function loadDocuments(uid) {
    try {
      const q = query(
        collection(db, "riderDocuments"),
        where("riderId", "==", uid)
      );

      const snapshot = await getDocs(q);

      const items = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setDocuments(items);
    } catch (err) {
      console.error("Documents error:", err);

      // Do not break the entire profile if documents collection
      // does not exist yet.
      setDocuments([]);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD ORDER STATS
  |--------------------------------------------------------------------------
  */

  async function loadOrderStats(uid) {
    try {
      const q = query(
        collection(db, "orders"),
        where("riderId", "==", uid)
      );

      const snapshot = await getDocs(q);

      let completed = 0;
      let cancelled = 0;
      let earnings = 0;

      snapshot.forEach((item) => {
        const order = item.data();

        if (order.status === "delivered") {
          completed += 1;
          earnings += Number(order.price || 0);
        }

        if (
          order.status === "declined" ||
          order.status === "cancelled"
        ) {
          cancelled += 1;
        }
      });

      setStats({
        total: snapshot.size,
        completed,
        cancelled,
        earnings,
      });
    } catch (err) {
      console.error("Order stats error:", err);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FORM UPDATE
  |--------------------------------------------------------------------------
  */

  function updateForm(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  /*
  |--------------------------------------------------------------------------
  | PROFILE COMPLETION
  |--------------------------------------------------------------------------
  */

  const completion = useMemo(() => {
    const checks = [
      Boolean(form.name),
      Boolean(form.phone),
      Boolean(photoURL),
      Boolean(form.vehicleType),
      Boolean(form.vehicleModel),
      Boolean(form.vehiclePlateNumber),
      Boolean(form.deliveryArea),
      Boolean(form.bankName),
      Boolean(form.accountName),
      Boolean(form.accountNumber),
      documents.length > 0,
    ];

    const completed = checks.filter(Boolean).length;

    return Math.round((completed / checks.length) * 100);
  }, [form, photoURL, documents]);

  /*
  |--------------------------------------------------------------------------
  | SAVE PROFILE
  |--------------------------------------------------------------------------
  */

  async function handleSaveProfile() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      navigate("/login");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const userRef = doc(db, "users", currentUser.uid);

      await updateDoc(userRef, {
        name: form.name.trim(),
        phone: form.phone.trim(),

        vehicle: {
          type: form.vehicleType,
          model: form.vehicleModel,
          plateNumber: form.vehiclePlateNumber.trim().toUpperCase(),
          color: form.vehicleColor.trim(),
        },

        preferences: {
          deliveryArea: form.deliveryArea.trim(),
          maxDistance: Number(form.maxDistance) || null,
          autoAccept: Boolean(form.autoAccept),
        },

        notifications: {
          newOrders: Boolean(form.newOrders),
          orderUpdates: Boolean(form.orderUpdates),
          paymentNotifications: Boolean(form.paymentNotifications),
          promotions: Boolean(form.promotions),
          systemAnnouncements: Boolean(form.systemAnnouncements),
        },

        payment: {
          bankName: form.bankName.trim(),
          accountName: form.accountName.trim(),
          accountNumber: form.accountNumber.trim(),
        },

        verification: {
          status: form.verificationStatus,
        },

        updatedAt: serverTimestamp(),
      });

      setSuccess("Profile updated successfully.");

      setUser((prev) => ({
        ...prev,
        name: form.name.trim(),
        phone: form.phone.trim(),
      }));
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | PROFILE PHOTO
  |--------------------------------------------------------------------------
  */

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photo must be less than 5MB.");
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      navigate("/login");
      return;
    }

    setPhotoUploading(true);
    setError("");
    setSuccess("");

    try {
      /*
       * Actual image → Cloudinary
       */
      const upload = await uploadToCloudinary(
        file,
        `oyasend/riders/${currentUser.uid}/profile`
      );

      /*
       * Only Cloudinary URL → Firebase
       */
      await updateDoc(doc(db, "users", currentUser.uid), {
        photoURL: upload.url,
        photoPublicId: upload.publicId,
        updatedAt: serverTimestamp(),
      });

      setPhotoURL(upload.url);

      setSuccess("Profile photo updated.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to upload profile photo.");
    } finally {
      setPhotoUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | AVAILABILITY
  |--------------------------------------------------------------------------
  */

  async function handleAvailabilityChange(value) {
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    setAvailabilitySaving(true);
    setError("");

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        isAvailable: value,
        updatedAt: serverTimestamp(),
      });

      setIsAvailable(value);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update availability.");
    } finally {
      setAvailabilitySaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DOCUMENT UPLOAD
  |--------------------------------------------------------------------------
  */

  async function handleDocumentUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const currentUser = auth.currentUser;

    if (!currentUser) {
      navigate("/login");
      return;
    }

    setDocumentUploading(true);
    setError("");
    setSuccess("");

    try {
      const existingDocument = documents.find(
        (document) => document.type === selectedDocumentType
      );

      /*
       * File → Cloudinary
       */
      const upload = await uploadToCloudinary(
        file,
        `oyasend/riders/${currentUser.uid}/documents`
      );

      /*
       * Metadata + Cloudinary URL → Firestore
       */
      const documentData = {
        riderId: currentUser.uid,
        type: selectedDocumentType,
        name: file.name,
        url: upload.url,
        publicId: upload.publicId,
        resourceType: upload.resourceType,
        status: "pending",
        uploadedAt: serverTimestamp(),
      };

      if (existingDocument) {
        await updateDoc(
          doc(db, "riderDocuments", existingDocument.id),
          documentData
        );
      } else {
        await addDoc(collection(db, "riderDocuments"), documentData);
      }

      await loadDocuments(currentUser.uid);

      setSuccess("Document uploaded successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to upload document.");
    } finally {
      setDocumentUploading(false);
      event.target.value = "";
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE DOCUMENT
  |--------------------------------------------------------------------------
  */

  async function handleDeleteDocument(documentId) {
    const confirmed = window.confirm(
      "Remove this document from your rider profile?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "riderDocuments", documentId));

      setDocuments((prev) =>
        prev.filter((document) => document.id !== documentId)
      );

      setSuccess("Document removed.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to remove document.");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CHANGE PASSWORD
  |--------------------------------------------------------------------------
  */

  async function handleChangePassword(event) {
    event.preventDefault();

    const currentUser = auth.currentUser;

    if (!currentUser?.email) {
      setError("Unable to identify your account email.");
      return;
    }

    if (!passwordForm.currentPassword) {
      setError("Enter your current password.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    setError("");
    setSuccess("");

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordForm.currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);

      await updatePassword(currentUser, passwordForm.newPassword);

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccess("Password changed successfully.");
    } catch (err) {
      console.error(err);

      if (err.code === "auth/wrong-password") {
        setError("Your current password is incorrect.");
      } else if (err.code === "auth/weak-password") {
        setError("Your new password is too weak.");
      } else {
        setError(err.message || "Unable to change password.");
      }
    } finally {
      setChangingPassword(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Unable to log out. Please try again.");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8F6] p-4 sm:p-6">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="mb-6 h-8 w-48 rounded bg-gray-200" />

          <div className="rounded-2xl bg-white p-6">
            <div className="flex gap-4">
              <div className="h-20 w-20 rounded-full bg-gray-200" />

              <div className="flex-1">
                <div className="mb-3 h-5 w-48 rounded bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-200" />
              </div>
            </div>
          </div>

          <div className="mt-5 h-64 rounded-2xl bg-white" />
          <div className="mt-5 h-64 rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  const riderName = form.name || "OYASEND Rider";

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-24">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/rider")}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#087443]"
          >
            ← Back to Dashboard
          </button>

          <div>
            <h1 className="text-2xl font-bold text-[#061A14]">
              Rider Profile
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your rider account, vehicle, documents and preferences.
            </p>
          </div>
        </div>

        {/* GLOBAL MESSAGES */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>⚠️</span>
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="ml-auto font-bold"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <span>✓</span>
            <span>{success}</span>

            <button
              onClick={() => setSuccess("")}
              className="ml-auto font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* PROFILE HEADER */}
        <section className="mb-5 overflow-hidden rounded-2xl bg-[#061A14] text-white shadow-sm">
          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt={riderName}
                      className="h-20 w-20 rounded-full border-4 border-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#087443] text-xl font-bold">
                      {getInitials(riderName)}
                    </div>
                  )}

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photoUploading}
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#061A14] bg-[#F4D500] text-sm text-[#061A14] shadow"
                    title="Change profile photo"
                  >
                    {photoUploading ? "..." : "✎"}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold">{riderName}</h2>

                    <span className="rounded-full bg-[#087443] px-2.5 py-1 text-[11px] font-semibold">
                      RIDER
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-white/60">
                    {user?.riderId || `OY-${user?.uid?.slice(0, 8)}`}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                      {user?.status || "Active"}
                    </span>

                    {form.verificationStatus === "verified" && (
                      <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs text-emerald-300">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="text-xs uppercase tracking-wide text-white/50">
                  Profile completion
                </p>

                <p className="mt-1 text-3xl font-bold">{completion}%</p>

                <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#F4D500] transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Total Orders</p>
            <p className="mt-2 text-xl font-bold text-[#061A14]">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="mt-2 text-xl font-bold text-emerald-700">
              {stats.completed}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Cancelled</p>
            <p className="mt-2 text-xl font-bold text-red-600">
              {stats.cancelled}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Total Earnings</p>
            <p className="mt-2 text-lg font-bold text-[#061A14]">
              {formatMoney(stats.earnings)}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* PERSONAL INFORMATION */}
          <SectionCard
            icon="👤"
            title="Personal Information"
            description="Keep your rider information up to date."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Full Name"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="Enter your full name"
              />

              <Field
                label="Phone Number"
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                placeholder="08012345678"
              />

              <Field
                label="Email"
                value={form.email}
                disabled
                placeholder="Email address"
              />

              <Field
                label="Rider ID"
                value={user?.riderId || "Not assigned"}
                disabled
              />
            </div>
          </SectionCard>

          {/* AVAILABILITY */}
          <SectionCard
            icon="🟢"
            title="Availability"
            description="Control whether you can receive new delivery orders."
          >
            <Toggle
              checked={isAvailable}
              onChange={handleAvailabilityChange}
              label={isAvailable ? "You are available" : "You are unavailable"}
              description={
                isAvailable
                  ? "You can receive delivery orders."
                  : "You will not be considered for new deliveries."
              }
            />

            {availabilitySaving && (
              <p className="mt-3 text-xs text-gray-500">
                Updating availability...
              </p>
            )}
          </SectionCard>

          {/* VEHICLE */}
          <SectionCard
            icon="🏍️"
            title="Vehicle Information"
            description="Add the vehicle you use for OYASEND deliveries."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Vehicle Type"
                value={form.vehicleType}
                onChange={(e) =>
                  updateForm("vehicleType", e.target.value)
                }
                options={[
                  { value: "motorcycle", label: "Motorcycle" },
                  { value: "car", label: "Car" },
                  { value: "van", label: "Van" },
                  { value: "truck", label: "Truck" },
                ]}
              />

              <Field
                label="Vehicle Model"
                value={form.vehicleModel}
                onChange={(e) =>
                  updateForm("vehicleModel", e.target.value)
                }
                placeholder="e.g. Honda CB125"
              />

              <Field
                label="Plate Number"
                value={form.vehiclePlateNumber}
                onChange={(e) =>
                  updateForm("vehiclePlateNumber", e.target.value)
                }
                placeholder="ABC-123-XY"
              />

              <Field
                label="Vehicle Color"
                value={form.vehicleColor}
                onChange={(e) =>
                  updateForm("vehicleColor", e.target.value)
                }
                placeholder="Black"
              />
            </div>
          </SectionCard>

          {/* DELIVERY PREFERENCES */}
          <SectionCard
            icon="📍"
            title="Delivery Preferences"
            description="Tell OYASEND what type of deliveries work best for you."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Preferred Delivery Area"
                value={form.deliveryArea}
                onChange={(e) =>
                  updateForm("deliveryArea", e.target.value)
                }
                placeholder="e.g. Lekki, Ikeja"
              />

              <Field
                label="Maximum Delivery Distance (km)"
                type="number"
                value={form.maxDistance}
                onChange={(e) =>
                  updateForm("maxDistance", e.target.value)
                }
                placeholder="25"
              />
            </div>

            <div className="mt-4">
              <Toggle
                checked={form.autoAccept}
                onChange={(value) => updateForm("autoAccept", value)}
                label="Auto-accept suitable orders"
                description="Automatically accept orders matching your delivery preferences."
              />
            </div>
          </SectionCard>

          {/* VERIFICATION */}
          <SectionCard
            icon="🪪"
            title="Verification / KYC"
            description="Your verification status is controlled by OYASEND administration."
          >
            <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-gray-800">
                  Rider verification
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {form.verificationStatus === "verified"
                    ? "Your rider account has been verified."
                    : form.verificationStatus === "pending"
                    ? "Your documents are currently being reviewed."
                    : form.verificationStatus === "rejected"
                    ? "Some documents require your attention."
                    : "Submit your required documents to begin verification."}
                </p>
              </div>

              <StatusBadge status={form.verificationStatus} />
            </div>
          </SectionCard>

          {/* DOCUMENTS */}
          <SectionCard
            icon="📄"
            title="Rider Documents"
            description="Upload documents required for rider verification."
          >
            <div className="rounded-xl border border-dashed border-gray-300 p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <SelectField
                  label="Document Type"
                  value={selectedDocumentType}
                  onChange={(e) =>
                    setSelectedDocumentType(e.target.value)
                  }
                  options={DOCUMENT_TYPES}
                />

                <div className="flex items-end">
                  <label className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#087443] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#065c35] sm:w-auto">
                    {documentUploading
                      ? "Uploading..."
                      : "Upload Document"}

                    <input
                      type="file"
                      accept="image/*,.pdf"
                      disabled={documentUploading}
                      onChange={handleDocumentUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {documents.length === 0 ? (
                <div className="rounded-xl bg-gray-50 p-5 text-center">
                  <p className="text-sm font-medium text-gray-600">
                    No documents uploaded yet.
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Upload your required rider documents above.
                  </p>
                </div>
              ) : (
                documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF5EF]">
                        📄
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {DOCUMENT_TYPES.find(
                            (item) => item.value === document.type
                          )?.label || document.type}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {document.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Uploaded {formatDate(document.uploadedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge
                        status={document.status || "pending"}
                      />

                      <a
                        href={document.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        View
                      </a>

                      <button
                        onClick={() =>
                          handleDeleteDocument(document.id)
                        }
                        className="rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          {/* EARNINGS */}
          <SectionCard
            icon="💰"
            title="Earnings"
            description="Your delivery earnings are calculated from completed orders."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#F6F8F6] p-4">
                <p className="text-xs text-gray-500">
                  Completed Deliveries
                </p>

                <p className="mt-2 text-2xl font-bold text-[#061A14]">
                  {stats.completed}
                </p>
              </div>

              <div className="rounded-xl bg-[#F6F8F6] p-4">
                <p className="text-xs text-gray-500">Total Earnings</p>

                <p className="mt-2 text-2xl font-bold text-[#087443]">
                  {formatMoney(stats.earnings)}
                </p>
              </div>

              <div className="rounded-xl bg-[#F6F8F6] p-4">
                <p className="text-xs text-gray-500">
                  Average / Delivery
                </p>

                <p className="mt-2 text-2xl font-bold text-[#061A14]">
                  {formatMoney(
                    stats.completed
                      ? stats.earnings / stats.completed
                      : 0
                  )}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* PAYMENT */}
          <SectionCard
            icon="🏦"
            title="Bank / Payment Details"
            description="Add the account where your OYASEND payouts should be sent."
          >
            <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
              Keep your payment information accurate. OYASEND will use these
              details for rider payouts.
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Bank Name"
                value={form.bankName}
                onChange={(e) =>
                  updateForm("bankName", e.target.value)
                }
                placeholder="e.g. GTBank"
              />

              <Field
                label="Account Name"
                value={form.accountName}
                onChange={(e) =>
                  updateForm("accountName", e.target.value)
                }
                placeholder="Account holder name"
              />

              <Field
                label="Account Number"
                value={form.accountNumber}
                onChange={(e) =>
                  updateForm("accountNumber", e.target.value)
                }
                placeholder="10 digit account number"
              />
            </div>
          </SectionCard>

          {/* NOTIFICATIONS */}
          <SectionCard
            icon="🔔"
            title="Notification Settings"
            description="Choose the notifications you want to receive."
          >
            <div className="space-y-2">
              <Toggle
                checked={form.newOrders}
                onChange={(value) => updateForm("newOrders", value)}
                label="New delivery orders"
                description="Receive notifications when new orders are assigned to you."
              />

              <Toggle
                checked={form.orderUpdates}
                onChange={(value) => updateForm("orderUpdates", value)}
                label="Order updates"
                description="Receive updates about your active deliveries."
              />

              <Toggle
                checked={form.paymentNotifications}
                onChange={(value) =>
                  updateForm("paymentNotifications", value)
                }
                label="Payment notifications"
                description="Get notified about rider payments and earnings."
              />

              <Toggle
                checked={form.promotions}
                onChange={(value) =>
                  updateForm("promotions", value)
                }
                label="Promotions"
                description="Receive OYASEND promotional messages."
              />

              <Toggle
                checked={form.systemAnnouncements}
                onChange={(value) =>
                  updateForm("systemAnnouncements", value)
                }
                label="System announcements"
                description="Important OYASEND system and account announcements."
              />
            </div>
          </SectionCard>

          {/* SECURITY */}
          <SectionCard
            icon="🔐"
            title="Security"
            description="Keep your OYASEND rider account secure."
          >
            <form onSubmit={handleChangePassword}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Current Password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="Current password"
                />

                <div />

                <Field
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Minimum 6 characters"
                />

                <Field
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Repeat new password"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="mt-5 rounded-xl bg-[#061A14] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0A2A22] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {changingPassword
                  ? "Changing Password..."
                  : "Change Password"}
              </button>
            </form>
          </SectionCard>

          {/* SAVE */}
          <div className="sticky bottom-3 z-20 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#061A14]">
                  Profile completion: {completion}%
                </p>

                <p className="text-xs text-gray-500">
                  Complete your profile to make your rider account ready.
                </p>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="rounded-xl bg-[#087443] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#065c35] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>

          {/* LOGOUT */}
          <div className="rounded-2xl border border-red-100 bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Sign out of OYASEND
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  You can sign back in anytime with your account.
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <button
            onClick={() => navigate("/rider")}
            className="flex flex-col items-center gap-1 px-4 py-2 text-gray-500"
          >
            <span>⌂</span>
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => navigate("/rider/orders")}
            className="flex flex-col items-center gap-1 px-4 py-2 text-gray-500"
          >
            <span>▣</span>
            <span className="text-[10px]">Orders</span>
          </button>

          <button
            className="flex flex-col items-center gap-1 px-4 py-2 text-[#087443]"
          >
            <span>●</span>
            <span className="text-[10px] font-semibold">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}