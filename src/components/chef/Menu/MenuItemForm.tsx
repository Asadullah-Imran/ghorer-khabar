"use client";

import Image from "next/image";
import { X, Plus, Trash2, Upload, X as CloseIcon, Loader2 } from "lucide-react";
import { useState, useRef } from "react";

interface Ingredient {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  cost?: number;
}

interface MenuImage {
  id?: string;
  imageUrl?: string;
  preview?: string;
  order?: number;
}

interface MenuItem {
  id?: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  prepTime?: number;
  calories?: number;
  spiciness?: string;
  isVegetarian?: boolean;
  images?: MenuImage[];
  ingredients?: Ingredient[];
  deletedImageIds?: string[];
}

interface MenuItemFormProps {
  item?: MenuItem;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
  isLoading?: boolean;
  uploading?: boolean;
}

export default function MenuItemForm({
  item,
  onClose,
  onSave,
  isLoading = false,
  uploading: uploadingProp = false,
}: MenuItemFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(uploadingProp);

  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    category: item?.category || "Rice",
    price: item?.price || 0,
    prepTime: item?.prepTime || 30,
    calories: item?.calories || 0,
    spiciness: item?.spiciness || "Medium",
    isVegetarian: item?.isVegetarian || false,
  });

  const [images, setImages] = useState<
    Array<{
      id?: string;
      file: File | null;
      preview: string;
      isNew?: boolean;
    }>
  >(
    item?.images
      ? item.images.map((img) => ({
          id: img.id,
          file: null,
          preview: img.imageUrl || img.preview || "",
          isNew: false,
        }))
      : []
  );

  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  const [ingredients, setIngredients] = useState<Ingredient[]>(
    item?.ingredients || []
  );

  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // console.log("\n=== FORM: handleSubmit STARTED ===");
    // console.log("Current form data:", formData);
    // console.log("Current images:", images);
    // console.log("Current ingredients:", ingredients);

    // Validation
    const newErrors: string[] = [];
    if (!formData.name.trim()) newErrors.push("Dish name is required");
    if (!formData.category) newErrors.push("Category is required");
    if (formData.price <= 0) newErrors.push("Price must be greater than 0");

    if (newErrors.length > 0) {
     // console.log("Validation errors:", newErrors);
      setErrors(newErrors);
      return;
    }

    const menuItem: MenuItem = {
      id: item?.id,
      ...formData,
      images: images,
      ingredients: ingredients,
      deletedImageIds: deletedImageIds,
    };

  //  console.log("Menu item to save:", menuItem);
   // console.log("=== FORM: handleSubmit calling onSave ===");
    onSave(menuItem);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      handleFile(e.currentTarget.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrors(["Please select a valid image file"]);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(["Image size must be less than 5MB"]);
      return;
    }

    // Add to images array
    setImages([
      ...images,
      {
        file,
        preview: URL.createObjectURL(file),
        isNew: true,
      },
    ]);
  };

  const removeImage = (index: number) => {
    const image = images[index];
    
    // If this is an existing image (has an ID), track it for deletion
    if (image.id && !image.isNew) {
      setDeletedImageIds([...deletedImageIds, image.id]);
    }
    
    // Clean up blob URL if it's a new image
    if (image.preview.startsWith("blob:")) {
      URL.revokeObjectURL(image.preview);
    }
    
    setImages(images.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: "", quantity: 0, unit: "gm", cost: 0 },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: any
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const totalIngredientCost = ingredients.reduce(
    (sum, ing) => sum + (ing.cost || 0),
    0
  );
  const profitMargin = formData.price - totalIngredientCost;
  const profitMarginPercent =
    totalIngredientCost > 0
      ? Math.round((profitMargin / formData.price) * 100)
      : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {item ? "Edit Menu Item" : "Add New Menu Item"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Dish Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., Shorshe Ilish"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
              rows={3}
              placeholder="Brief description of the dish"
            />
          </div>

          {/* Category & Prep Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="Rice">Rice</option>
                <option value="Beef">Beef</option>
                <option value="Chicken">Chicken</option>
                <option value="Fish">Fish</option>
                <option value="Vegetarian">Vegetarian</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Prep Time (mins)
              </label>
              <input
                type="number"
                value={formData.prepTime}
                onChange={(e) =>
                  setFormData({ ...formData, prepTime: parseInt(e.target.value) })
                }                onFocus={(e) => {
                  if (e.target.value === "30") {
                    e.target.value = "";
                  }
                }}                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                min="10"
              />
            </div>
          </div>

          {/* Price & Calories */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Price (৳) *
              </label>
              <input
                type="number"
                required
                disabled={uploading || isLoading}
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                }
                onFocus={(e) => {
                  if (e.target.value === "0" || e.target.value === "") {
                    e.target.value = "";
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Calories
              </label>
              <input
                type="number"
                onFocus={(e) => {
                  if (e.target.value === "0" || e.target.value === "") {
                    e.target.value = "";
                  }
                }}
                disabled={uploading || isLoading}
                value={formData.calories}
                onChange={(e) =>
                  setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100"
                min="0"
              />
            </div>
          </div>

          {/* Spiciness & Vegetarian */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Spiciness
              </label>
              <select
                disabled={uploading || isLoading}
                value={formData.spiciness}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    spiciness: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
              >
                <option value="Mild">Mild</option>
                <option value="Medium">Medium</option>
                <option value="Hot">Hot</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={uploading || isLoading}
                  checked={formData.isVegetarian}
                  onChange={(e) =>
                    setFormData({ ...formData, isVegetarian: e.target.checked })
                  }
                  className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 disabled:opacity-50"
                />
                <span className="text-sm font-semibold text-gray-900">
                  Vegetarian
                </span>
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Dish Images
            </label>

            {/* Drag and Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                dragActive
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-300 bg-gray-50 hover:border-teal-400"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading || isLoading}
                className="hidden"
              />

              <Upload className="mx-auto mb-2 text-teal-600" size={32} />
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Drag and drop images or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supported: JPG, PNG, WebP, GIF (Max 5MB each)
              </p>
            </div>

            {/* Images Preview */}
            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-600 mb-3">
                  {images.length} image{images.length !== 1 ? "s" : ""} selected
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden border-2 border-gray-200 aspect-square"
                    >
                      <Image
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="w-full h-full object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-teal-600 text-white text-xs font-semibold px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                      {image.isNew && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                          New
                        </div>
                      )}
                      <button
                        type="button"
                        disabled={uploading || isLoading}
                        onClick={() => removeImage(index)}
                        className="absolute bottom-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                        title="Remove image"
                      >
                        <CloseIcon size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  The first image will be used as the primary dish image
                </p>
              </div>
            )}
          </div>

          {/* Ingredients Section */}
          <div className="border border-teal-200 rounded-lg p-4 bg-teal-50">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-gray-900">
                Ingredients & Costs
              </label>
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center gap-1 text-sm text-teal-600 font-medium hover:text-teal-700"
              >
                <Plus size={16} />
                Add Ingredient
              </button>
            </div>

            {ingredients.length === 0 ? (
              <p className="text-sm text-gray-500 italic py-2">
                No ingredients added yet. Click &quot;Add Ingredient&quot; to get started.
              </p>
            ) : (
              <div className="space-y-3 mb-4">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2 items-end bg-white p-3 rounded-lg border border-teal-100">
                    {/* Ingredient Name */}
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) =>
                          updateIngredient(index, "name", e.target.value)
                        }
                        className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., Hilsa Fish"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="w-20">
                      <label className="block text-xs text-gray-600 mb-1">
                        Qty
                      </label>
                      <input
                        type="text"
                        value={ingredient.quantity}
                        onChange={(e) =>
                          updateIngredient(index, "quantity", e.target.value)
                        }
                        onFocus={(e) => {
                          if (e.target.value === "0" || e.target.value === "") {
                            e.target.value = "";
                          }
                        }}
                        className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                        placeholder="500"
                      />
                    </div>

                    {/* Unit */}
                    <div className="w-20">
                      <label className="block text-xs text-gray-600 mb-1">
                        Unit
                      </label>
                      <select
                        disabled={uploading || isLoading}
                        value={ingredient.unit}
                        onChange={(e) =>
                          updateIngredient(index, "unit", e.target.value)
                        }
                        className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                      >
                        <option value="gm">gm</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">liter</option>
                        <option value="pcs">pcs</option>
                        <option value="cup">cup</option>
                      </select>
                    </div>

                    {/* Cost */}
                    <div className="w-24">
                      <label className="block text-xs text-gray-600 mb-1">
                        Cost (৳)
                      </label>
                      <input
                        onFocus={(e) => {
                          if (e.target.value === "0" || e.target.value === "") {
                            e.target.value = "";
                          }
                        }}
                        type="number"
                        value={ingredient.cost || 0}
                        onChange={(e) =>
                          updateIngredient(index, "cost", parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Cost Summary */}
            {ingredients.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-teal-100 mt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">
                      Total Ingredient Cost
                    </p>
                    <p className="text-lg font-bold text-orange-600">
                      ৳{totalIngredientCost.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Menu Price</p>
                    <p className="text-lg font-bold text-teal-600">
                      ৳{formData.price.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Profit Margin</p>
                    <p
                      className={`text-lg font-bold ${
                        profitMargin >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ৳{profitMargin.toFixed(0)} ({profitMarginPercent}%)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={uploading || isLoading}
              className="flex-1 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="animate-spin" size={20} />}
              {item ? "Update Menu Item" : "Add Menu Item"}
            </button>
            <button
              type="button"
              disabled={uploading || isLoading}
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
