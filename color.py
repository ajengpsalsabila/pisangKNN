import base64
import cv2
import numpy as np
from collections import Counter

def bgr_to_hsv(bgr):
    bgr = bgr.astype("float32") / 255
    blue, green, red = bgr[..., 0], bgr[..., 1], bgr[..., 2]
    max_color, min_color = np.max(bgr, axis=-1), np.min(bgr, axis=-1)
    diff = max_color - min_color + 1e-10 
    value = max_color
    saturation = np.zeros_like(max_color)
    saturation[max_color != 0] = diff[max_color != 0] / max_color[max_color != 0]
    hue = np.zeros_like(max_color)
    mask = max_color == red
    hue[mask] = (green[mask] - blue[mask]) / diff[mask]
    mask = max_color == green
    hue[mask] = 2.0 + (blue[mask] - red[mask]) / diff[mask]
    mask = max_color == blue
    hue[mask] = 4.0 + (red[mask] - green[mask]) / diff[mask]
    hue = (hue / 6) % 1
    hsv = np.stack([hue, saturation, value], axis=-1)
    return (hsv * np.array([180, 255, 255])).astype("uint8")

def calculate_similarity(hist1, hist2):
    hist1 = hist1 / (sum(hist1) + 1e-10)
    hist2 = hist2 / (sum(hist2) + 1e-10)
    dot_product = np.dot(hist1.flatten(), hist2.flatten())
    norm_hist1 = np.linalg.norm(hist1)
    norm_hist2 = np.linalg.norm(hist2)
    similarity = dot_product / (norm_hist1 * norm_hist2)
    return similarity * 100

def knn_ripeness(X_train, y_train, x_test, k=3):
    distances = [euclidean_distance(x_test, x_train) for x_train in X_train]
    k_indices = np.argsort(distances)[:k]
    k_nearest_labels = [y_train[i] for i in k_indices]
    average_ripeness = np.mean(k_nearest_labels)
    return average_ripeness

def euclidean_distance(x1, x2):
    return np.sqrt(np.sum((x1 - x2) ** 2))

def calculate_ripeness(image_hsv):
    # Extract the Hue channel
    hue_channel = image_hsv[:, :, 0]
    hue_mean = hue_channel.mean()
    hue_std = hue_channel.std()

    unripe_hue_range = (60, 90)  
    ripe_hue_range = (25, 60)    
    overripe_hue_range = (0, 25)  

    if hue_mean >= unripe_hue_range[0]:
        ripeness_percentage = ((hue_mean - unripe_hue_range[0]) / (unripe_hue_range[1] - unripe_hue_range[0])) * 25 + 75  # Unripe
    elif ripe_hue_range[0] <= hue_mean < unripe_hue_range[0]:
        ripeness_percentage = ((hue_mean - ripe_hue_range[0]) / (ripe_hue_range[1] - ripe_hue_range[0])) * 50 + 25  # Ripe
    elif overripe_hue_range[0] <= hue_mean < ripe_hue_range[0]:
        ripeness_percentage = ((hue_mean - overripe_hue_range[0]) / (overripe_hue_range[1] - overripe_hue_range[0])) * 25  # Overripe
    else:
        ripeness_percentage = 0 

    ripeness_percentage -= hue_std / 10

    return ripeness_percentage

async def color_knn(dataset, image):
    image_contents = await image.read()
    root_image = cv2.imdecode(np.frombuffer(image_contents, np.uint8), cv2.IMREAD_COLOR)
    root_image_hsv = bgr_to_hsv(root_image)
    root_histogram = cv2.calcHist(
        [root_image_hsv], [0, 1], None, [180, 256], [0, 180, 0, 256]
    ).flatten()

    X_train = []
    y_train = []

    similar_images = []
    for dataset_image in dataset:
        dataset_contents = await dataset_image.read()
        dataset_image = cv2.imdecode(
            np.frombuffer(dataset_contents, np.uint8), cv2.IMREAD_COLOR
        )
        dataset_image_hsv = bgr_to_hsv(dataset_image)
        dataset_histogram = cv2.calcHist(
            [dataset_image_hsv], [0, 1], None, [180, 256], [0, 180, 0, 256]
        ).flatten()
        
        dataset_ripeness = calculate_ripeness(dataset_image_hsv) 

        X_train.append(dataset_histogram)
        y_train.append(dataset_ripeness)

        similarity = calculate_similarity(root_histogram, dataset_histogram)

        if similarity >= 60:
            _, buffer = cv2.imencode(".jpg", dataset_image)
            dataset_image_base64 = base64.b64encode(buffer).decode("utf-8")
            similar_images.append(
                {
                    "base64imagedata": dataset_image_base64,
                    "similaritypercentage": similarity,
                    "ripeness": dataset_ripeness
                }
            )
    similar_images = sorted(
        similar_images, key=lambda x: x["similaritypercentage"], reverse=True
    )

    # Predict ripeness percentage using k-NN
    root_ripeness_percentage = knn_ripeness(X_train, y_train, root_histogram, k=3)

    return {
        "input_image_ripeness": root_ripeness_percentage,
        "similar_images": similar_images
    }