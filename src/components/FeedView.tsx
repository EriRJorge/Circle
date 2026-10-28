import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "firebase/auth";
import {
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	CardMedia,
	Container,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import {
	BookmarkBorder,
	FavoriteBorder,
	ImageOutlined,
	ModeCommentOutlined,
	MoreHoriz,
} from "@mui/icons-material";
import { createPost, getVisiblePosts, uploadImage, type Post, type PostVisibility, type Profile } from "../lib/firebase";

interface FeedViewProps {
	user: User;
	profile: Profile;
}

export function FeedView({ user, profile }: FeedViewProps) {
	const [posts, setPosts] = useState<Post[]>([]);
	const [content, setContent] = useState("");
	const [visibility, setVisibility] = useState<PostVisibility>("circle");
	const [mediaURL, setMediaURL] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const loadPosts = useCallback(async () => {
		setIsLoading(true);
		setError("");
		try {
			setPosts(await getVisiblePosts(user.uid, profile.state));
		} catch (loadError) {
			setError(loadError instanceof Error ? loadError.message : "Unable to load posts.");
		} finally {
			setIsLoading(false);
		}
	}, [profile.state, user.uid]);

	useEffect(() => {
		// Loading remote posts updates state after the request resolves.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		void loadPosts();
	}, [loadPosts]);

	const handleMediaUpload = async (file: File) => {
		setError("");
		try {
			setMediaURL(await uploadImage(`posts/${user.uid}/${crypto.randomUUID()}`, file));
		} catch (uploadError) {
			setError(uploadError instanceof Error ? uploadError.message : "Unable to upload the post image.");
		}
	};

	const handleCreatePost = async () => {
		if (!content.trim() || (visibility === "public" && !profile.state.trim())) {
			setError(
				visibility === "public"
					? "Add your state to your profile before sharing a public post."
					: "Write something before posting.",
			);
			return;
		}
		setIsSaving(true);
		setError("");
		try {
			await createPost(user, profile, content, visibility, mediaURL);
			setContent("");
			setMediaURL("");
			setVisibility("circle");
			await loadPosts();
		} catch (saveError) {
			setError(saveError instanceof Error ? saveError.message : "Unable to save your post.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #e6fffa 100%)", pb: 10 }}>
			<Container maxWidth="md" sx={{ pt: 3, pb: 3 }}>
				<Box sx={{ textAlign: "center", py: 1, mb: 1 }}>
					<Typography variant="h5" sx={{ fontWeight: 700, color: "#059669" }}>The Promenade</Typography>
					<Typography variant="body2" color="text.secondary">Share moments with your circle</Typography>
				</Box>
				<Card sx={{ borderRadius: 2, mb: 3, p: 1.5 }}>
					<Stack spacing={1.5}>
						<Stack direction="row" spacing={1.5} alignItems="center">
							<Avatar src={profile.photoURL}>{profile.displayName.slice(0, 1)}</Avatar>
							<TextField
								fullWidth
								variant="outlined"
								size="small"
								placeholder="Share something with your circle..."
								value={content}
								onChange={(event) => setContent(event.target.value)}
								InputProps={{ sx: { borderRadius: 6 } }}
							/>
						</Stack>
						<Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
							<Button
								startIcon={<ImageOutlined />}
								onClick={() => fileInputRef.current?.click()}
								sx={{ color: "#059669", textTransform: "none" }}
							>
								{mediaURL ? "Change photo" : "Photo"}
							</Button>
							<FormControl size="small" sx={{ minWidth: 190 }}>
								<InputLabel id="post-visibility-label">Who can see this?</InputLabel>
								<Select
									labelId="post-visibility-label"
									value={visibility}
									label="Who can see this?"
									onChange={(event) => setVisibility(event.target.value as PostVisibility)}
								>
									<MenuItem value="circle">My Circle only</MenuItem>
									<MenuItem value="public">Public in my state</MenuItem>
								</Select>
							</FormControl>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								hidden
								onChange={(event) => {
									const file = event.target.files?.[0];
									if (file) void handleMediaUpload(file);
								}}
							/>
							<Button variant="contained" sx={{ borderRadius: 6 }} onClick={() => void handleCreatePost()} disabled={isSaving || !content.trim()}>
								{isSaving ? "Saving..." : "Post"}
							</Button>
						</Stack>
						{mediaURL && <Typography variant="caption" color="success.main">Image attached and ready to save.</Typography>}
						{error && <Typography color="error">{error}</Typography>}
					</Stack>
				</Card>
				{isLoading && <Typography align="center">Loading posts...</Typography>}
				{!isLoading && posts.length === 0 && (
					<Card sx={{ borderRadius: 3, p: 4, textAlign: "center" }}>
						<Typography variant="h6">Your feed is waiting for a post.</Typography>
						<Typography color="text.secondary">Posts from your confirmed Circle and public posts from your state will appear here.</Typography>
					</Card>
				)}
				<Stack spacing={3}>
					{posts.map((post) => (
						<Card key={post.id} sx={{ borderRadius: 3 }}>
							<CardContent>
								<Stack direction="row" spacing={2} alignItems="center" mb={1.5}>
									<Avatar src={post.authorPhotoURL}>{post.authorName.slice(0, 1)}</Avatar>
									<Box sx={{ flex: 1 }}>
										<Typography fontWeight={600}>{post.authorName}</Typography>
										<Typography variant="caption" color="text.secondary">
											{post.visibility === "public" ? `Public in ${post.state}` : "Circle only"}
										</Typography>
									</Box>
									<MoreHoriz color="action" />
								</Stack>
										<Typography sx={{ whiteSpace: "pre-wrap" }}>{post.content}</Typography>
									</CardContent>
									{post.mediaURL && <CardMedia component="img" image={post.mediaURL} alt="Post attachment" sx={{ maxHeight: 400, objectFit: "cover" }} />}
									<Stack direction="row" justifyContent="space-between" sx={{ px: 2, pb: 1 }}>
										<Stack direction="row" spacing={1}>
											<FavoriteBorder color="action" />
											<ModeCommentOutlined color="action" />
										</Stack>
										<BookmarkBorder color="action" />
									</Stack>
						</Card>
					))}
				</Stack>
			</Container>
		</Box>
	);
}
