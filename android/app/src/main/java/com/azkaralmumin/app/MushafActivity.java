package com.azkaralmumin.app;

import android.app.Dialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.res.ColorStateList;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.ColorMatrix;
import android.graphics.ColorMatrixColorFilter;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.text.InputType;
import android.util.LruCache;
import android.util.TypedValue;
import android.view.GestureDetector;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.inputmethod.EditorInfo;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.viewpager2.widget.ViewPager2;

import com.davemorrissey.labs.subscaleview.ImageSource;
import com.davemorrissey.labs.subscaleview.SubsamplingScaleImageView;

import java.io.File;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * The Madinah mushaf, page by page: right-to-left swiping like a paper mushaf
 * (or continuous vertical scrolling), pinch and double-tap zoom, top and bottom
 * bars that a tap hides, an index of surahs / juz / bookmarks, night mode and
 * a whole-mushaf download for offline reading. Opened from JS (MushafPlugin).
 */
public class MushafActivity extends AppCompatActivity {
    static final String EXTRA_PAGE = "page";
    static final String EXTRA_SURAH_NAMES = "surahNames";
    static final String EXTRA_SURAH_STARTS = "surahStarts";
    static final String EXTRA_JUZ_STARTS = "juzStarts";
    static final String EXTRA_LABELS = "labels";
    static final String EXTRA_ARABIC_DIGITS = "arabicDigits";
    static final String EXTRA_RTL = "rtl";
    static final String PREFS = "mushaf";
    static final String KEY_LAST_PAGE = "last_page";
    static final String KEY_BOOKMARKS = "bookmarks";
    private static final String KEY_VERTICAL = "vertical";
    private static final String KEY_NIGHT = "night";

    /** Height / width of the King Fahd page images. */
    private static final float PAGE_ASPECT = 1205f / 807f;
    private static final int BAR_COLOR = 0xEE052418;
    private static final int GOLD = 0xFFFACC15;
    private static final int PAGE_LIGHT = 0xFFFFFDF7;
    private static final int BACKGROUND_LIGHT = 0xFFF3EBDD;
    private static final int BACKGROUND_NIGHT = 0xFF0B0B0B;

    private SharedPreferences prefs;
    private String[] surahNames;
    private int[] surahStarts;
    private int[] juzStarts;
    private Bundle labels;
    private boolean arabicDigits;
    private boolean rtl;

    private FrameLayout root;
    private ViewPager2 pager;
    private RecyclerView list;
    private LinearLayout topBar;
    private LinearLayout bottomBar;
    private TextView titleView;
    private TextView subtitleView;
    private TextView pageView;
    private SeekBar seek;
    private ImageButton markButton;
    private ImageButton modeButton;
    private ImageButton nightButton;
    private Dialog indexDialog;
    private MushafPages.ProgressListener bulkListener;

    private int currentPage = 1;
    private boolean vertical;
    private boolean night;
    private boolean barsVisible = true;
    private final Set<Integer> bookmarks = new TreeSet<>();

    private final ExecutorService decoder = Executors.newFixedThreadPool(2);
    private final LruCache<Integer, Bitmap> stripCache = new LruCache<Integer, Bitmap>(
        (int) Math.min(48L * 1024 * 1024, Runtime.getRuntime().maxMemory() / 6)) {
        @Override
        protected int sizeOf(Integer key, Bitmap value) {
            return value.getByteCount();
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        Bundle extras = getIntent().getExtras() == null ? new Bundle() : getIntent().getExtras();
        surahNames = extras.getStringArray(EXTRA_SURAH_NAMES);
        surahStarts = extras.getIntArray(EXTRA_SURAH_STARTS);
        juzStarts = extras.getIntArray(EXTRA_JUZ_STARTS);
        labels = extras.getBundle(EXTRA_LABELS) == null ? new Bundle() : extras.getBundle(EXTRA_LABELS);
        arabicDigits = extras.getBoolean(EXTRA_ARABIC_DIGITS, true);
        rtl = extras.getBoolean(EXTRA_RTL, true);
        if (surahNames == null || surahStarts == null || surahNames.length != 114 || surahStarts.length != 114) {
            surahNames = new String[114];
            surahStarts = new int[114];
            for (int i = 0; i < 114; i++) {
                surahNames[i] = String.valueOf(i + 1);
                surahStarts[i] = 1;
            }
        }
        if (juzStarts == null || juzStarts.length != 30) juzStarts = new int[]{1};
        for (String page : prefs.getStringSet(KEY_BOOKMARKS, new HashSet<>())) {
            try {
                bookmarks.add(Integer.parseInt(page));
            } catch (NumberFormatException ignored) {
                // Not a page number; skip it.
            }
        }
        vertical = prefs.getBoolean(KEY_VERTICAL, false);
        night = prefs.getBoolean(KEY_NIGHT, false);
        int requested = extras.getInt(EXTRA_PAGE, 0);
        currentPage = clamp(requested > 0 ? requested : prefs.getInt(KEY_LAST_PAGE, 1));

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        buildViews();
        setContentView(root);
        applyMode(false);
        applyNight();
        showPage(currentPage, false);
    }

    // ------------------------------------------------------------------ views

    private void buildViews() {
        root = new FrameLayout(this);
        root.setLayoutDirection(rtl ? View.LAYOUT_DIRECTION_RTL : View.LAYOUT_DIRECTION_LTR);

        pager = new ViewPager2(this);
        // RTL: the next page lies to the left and is pulled in from the left,
        // as when turning the pages of a printed mushaf.
        pager.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        pager.setOffscreenPageLimit(1);
        pager.setAdapter(new PageAdapter());
        pager.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                int previous = currentPage;
                onPageShown(position + 1);
                pager.setUserInputEnabled(true);
                PageHolder old = holderFor(previous - 1);
                if (old != null && previous != currentPage) old.image.resetScaleAndCenter();
            }
        });
        root.addView(pager, new FrameLayout.LayoutParams(-1, -1));

        list = new RecyclerView(this);
        list.setLayoutManager(new LinearLayoutManager(this));
        list.setAdapter(new StripAdapter());
        list.setItemViewCacheSize(2);
        list.addOnScrollListener(new RecyclerView.OnScrollListener() {
            @Override
            public void onScrolled(@NonNull RecyclerView view, int dx, int dy) {
                View center = view.findChildViewUnder(view.getWidth() / 2f, view.getHeight() / 2f);
                if (center == null) return;
                int position = view.getChildAdapterPosition(center);
                if (position != RecyclerView.NO_POSITION && position + 1 != currentPage) onPageShown(position + 1);
            }
        });
        root.addView(list, new FrameLayout.LayoutParams(-1, -1));

        buildTopBar();
        buildBottomBar();
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, insets) -> {
            Insets bars = insets.getInsetsIgnoringVisibility(WindowInsetsCompat.Type.systemBars());
            topBar.setPadding(dp(6), bars.top + dp(6), dp(6), dp(8));
            bottomBar.setPadding(dp(16), dp(10), dp(16), bars.bottom + dp(12));
            return insets;
        });
    }

    private void buildTopBar() {
        topBar = new LinearLayout(this);
        topBar.setOrientation(LinearLayout.HORIZONTAL);
        topBar.setGravity(Gravity.CENTER_VERTICAL);
        topBar.setBackgroundColor(BAR_COLOR);
        topBar.setClickable(true);

        topBar.addView(iconButton(R.drawable.ic_mushaf_back, label("back", "رجوع"), v -> finish()));

        LinearLayout titles = new LinearLayout(this);
        titles.setOrientation(LinearLayout.VERTICAL);
        titles.setPadding(dp(6), 0, dp(6), 0);
        titleView = new TextView(this);
        titleView.setTextColor(Color.WHITE);
        titleView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18);
        titleView.setTypeface(Typeface.DEFAULT_BOLD);
        titleView.setSingleLine(true);
        titles.addView(titleView);
        subtitleView = new TextView(this);
        subtitleView.setTextColor(0xFFB7E4C7);
        subtitleView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
        subtitleView.setSingleLine(true);
        titles.addView(subtitleView);
        topBar.addView(titles, new LinearLayout.LayoutParams(0, -2, 1f));

        markButton = iconButton(R.drawable.ic_mushaf_bookmark, label("bookmark", "علامة"), v -> toggleBookmark());
        topBar.addView(markButton);
        modeButton = iconButton(R.drawable.ic_mushaf_vertical, label("vertical", "عرض رأسي"), v -> {
            vertical = !vertical;
            prefs.edit().putBoolean(KEY_VERTICAL, vertical).apply();
            applyMode(true);
        });
        topBar.addView(modeButton);
        nightButton = iconButton(R.drawable.ic_mushaf_night, label("night", "الوضع الليلي"), v -> {
            night = !night;
            prefs.edit().putBoolean(KEY_NIGHT, night).apply();
            applyNight();
        });
        topBar.addView(nightButton);
        topBar.addView(iconButton(R.drawable.ic_mushaf_index, label("index", "الفهرس"), v -> showIndex()));

        root.addView(topBar, new FrameLayout.LayoutParams(-1, -2, Gravity.TOP));
    }

    private void buildBottomBar() {
        bottomBar = new LinearLayout(this);
        bottomBar.setOrientation(LinearLayout.VERTICAL);
        bottomBar.setBackgroundColor(BAR_COLOR);
        bottomBar.setClickable(true);

        pageView = new TextView(this);
        pageView.setTextColor(Color.WHITE);
        pageView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        pageView.setTypeface(Typeface.DEFAULT_BOLD);
        pageView.setGravity(Gravity.CENTER);
        bottomBar.addView(pageView);

        seek = new SeekBar(this);
        seek.setMax(MushafPages.TOTAL - 1);
        // Page 1 on the right, like the mushaf itself.
        seek.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        seek.setProgressTintList(ColorStateList.valueOf(GOLD));
        seek.setThumbTintList(ColorStateList.valueOf(GOLD));
        seek.setProgressBackgroundTintList(ColorStateList.valueOf(0x66FFFFFF));
        seek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar bar, int progress, boolean fromUser) {
                if (fromUser) pageView.setText(pageLine(progress + 1));
            }

            @Override
            public void onStartTrackingTouch(SeekBar bar) {}

            @Override
            public void onStopTrackingTouch(SeekBar bar) {
                showPage(bar.getProgress() + 1, false);
            }
        });
        LinearLayout.LayoutParams seekParams = new LinearLayout.LayoutParams(-1, -2);
        seekParams.topMargin = dp(6);
        bottomBar.addView(seek, seekParams);

        root.addView(bottomBar, new FrameLayout.LayoutParams(-1, -2, Gravity.BOTTOM));
    }

    private ImageButton iconButton(int icon, String description, View.OnClickListener click) {
        ImageButton button = new ImageButton(this);
        button.setImageResource(icon);
        button.setContentDescription(description);
        button.setColorFilter(Color.WHITE);
        TypedValue ripple = new TypedValue();
        getTheme().resolveAttribute(android.R.attr.selectableItemBackgroundBorderless, ripple, true);
        button.setBackgroundResource(ripple.resourceId);
        button.setOnClickListener(click);
        button.setLayoutParams(new LinearLayout.LayoutParams(dp(44), dp(44)));
        return button;
    }

    // ------------------------------------------------------------- navigation

    private void showPage(int page, boolean smooth) {
        page = clamp(page);
        if (vertical) {
            ((LinearLayoutManager) list.getLayoutManager()).scrollToPositionWithOffset(page - 1, 0);
        } else {
            pager.setCurrentItem(page - 1, smooth);
        }
        onPageShown(page);
    }

    private void onPageShown(int page) {
        currentPage = clamp(page);
        prefs.edit().putInt(KEY_LAST_PAGE, currentPage).apply();
        titleView.setText(surahTitle(currentPage));
        subtitleView.setText(label("juz", "الجزء") + " " + num(juzOf(currentPage)) + "  ·  "
            + label("page", "صفحة") + " " + num(currentPage));
        pageView.setText(pageLine(currentPage));
        if (seek.getProgress() != currentPage - 1) seek.setProgress(currentPage - 1);
        boolean marked = bookmarks.contains(currentPage);
        markButton.setImageResource(marked ? R.drawable.ic_mushaf_bookmarked : R.drawable.ic_mushaf_bookmark);
        markButton.setColorFilter(marked ? GOLD : Color.WHITE);
        for (int d = 1; d <= 2; d++) {
            MushafPages.prefetch(this, currentPage + d);
            MushafPages.prefetch(this, currentPage - d);
        }
    }

    private void applyMode(boolean keepPage) {
        int page = currentPage;
        pager.setVisibility(vertical ? View.GONE : View.VISIBLE);
        list.setVisibility(vertical ? View.VISIBLE : View.GONE);
        modeButton.setImageResource(vertical ? R.drawable.ic_mushaf_horizontal : R.drawable.ic_mushaf_vertical);
        modeButton.setContentDescription(vertical ? label("horizontal", "عرض أفقي") : label("vertical", "عرض رأسي"));
        if (keepPage) {
            showPage(page, false);
            Toast.makeText(this, vertical ? label("vertical", "عرض رأسي") : label("horizontal", "عرض أفقي"), Toast.LENGTH_SHORT).show();
        }
    }

    private void applyNight() {
        root.setBackgroundColor(night ? BACKGROUND_NIGHT : BACKGROUND_LIGHT);
        Paint paint = null;
        if (night) {
            // Inverted, then hue-rotated back: black text on cream becomes light
            // text on near-black while the frame keeps its blue.
            ColorMatrix invert = new ColorMatrix(new float[]{
                -1, 0, 0, 0, 255,
                0, -1, 0, 0, 255,
                0, 0, -1, 0, 255,
                0, 0, 0, 1, 0});
            ColorMatrix hue = new ColorMatrix(new float[]{
                -0.574f, 1.430f, 0.144f, 0, 0,
                0.426f, 0.430f, 0.144f, 0, 0,
                0.426f, 1.430f, -0.856f, 0, 0,
                0, 0, 0, 1, 0});
            ColorMatrix both = new ColorMatrix();
            both.setConcat(hue, invert);
            paint = new Paint();
            paint.setColorFilter(new ColorMatrixColorFilter(both));
        }
        pager.setLayerType(night ? View.LAYER_TYPE_HARDWARE : View.LAYER_TYPE_NONE, paint);
        list.setLayerType(night ? View.LAYER_TYPE_HARDWARE : View.LAYER_TYPE_NONE, paint);
        nightButton.setColorFilter(night ? GOLD : Color.WHITE);
    }

    private void toggleBars() {
        barsVisible = !barsVisible;
        topBar.animate().alpha(barsVisible ? 1f : 0f).translationY(barsVisible ? 0 : -topBar.getHeight()).setDuration(180).start();
        bottomBar.animate().alpha(barsVisible ? 1f : 0f).translationY(barsVisible ? 0 : bottomBar.getHeight()).setDuration(180).start();
        topBar.setEnabled(barsVisible);
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), root);
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        if (barsVisible) controller.show(WindowInsetsCompat.Type.systemBars());
        else controller.hide(WindowInsetsCompat.Type.systemBars());
        // Hidden bars must not catch taps meant for the page.
        topBar.setVisibility(View.VISIBLE);
        bottomBar.setVisibility(View.VISIBLE);
        topBar.setClickable(barsVisible);
        bottomBar.setClickable(barsVisible);
        setChildrenEnabled(topBar, barsVisible);
        setChildrenEnabled(bottomBar, barsVisible);
    }

    private void setChildrenEnabled(ViewGroup group, boolean enabled) {
        for (int i = 0; i < group.getChildCount(); i++) {
            View child = group.getChildAt(i);
            child.setEnabled(enabled);
            if (child instanceof ViewGroup) setChildrenEnabled((ViewGroup) child, enabled);
        }
    }

    private void toggleBookmark() {
        boolean added = bookmarks.add(currentPage);
        if (!added) bookmarks.remove(currentPage);
        saveBookmarks();
        onPageShown(currentPage);
        Toast.makeText(this, added ? label("bookmarkAdded", "أُضيفت علامة على هذه الصفحة") : label("bookmarkRemoved", "أُزيلت العلامة"), Toast.LENGTH_SHORT).show();
    }

    private void saveBookmarks() {
        Set<String> stored = new HashSet<>();
        for (int page : bookmarks) stored.add(String.valueOf(page));
        prefs.edit().putStringSet(KEY_BOOKMARKS, stored).apply();
    }

    // ------------------------------------------------------------------ index

    private void showIndex() {
        indexDialog = new Dialog(this);
        indexDialog.requestWindowFeature(android.view.Window.FEATURE_NO_TITLE);
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setLayoutDirection(rtl ? View.LAYOUT_DIRECTION_RTL : View.LAYOUT_DIRECTION_LTR);
        box.setPadding(dp(18), dp(16), dp(18), dp(14));
        GradientDrawable shape = new GradientDrawable();
        shape.setColor(0xFF0F2A20);
        shape.setCornerRadius(dp(22));
        box.setBackground(shape);

        TextView heading = text(label("index", "الفهرس"), 18, Color.WHITE, true);
        box.addView(heading);

        // Go to page.
        LinearLayout goRow = new LinearLayout(this);
        goRow.setOrientation(LinearLayout.HORIZONTAL);
        goRow.setGravity(Gravity.CENTER_VERTICAL);
        goRow.setPadding(0, dp(12), 0, dp(10));
        EditText pageInput = new EditText(this);
        pageInput.setInputType(InputType.TYPE_CLASS_NUMBER);
        pageInput.setImeOptions(EditorInfo.IME_ACTION_GO);
        pageInput.setHint(label("pageHint", "رقم الصفحة") + " (1–604)");
        pageInput.setTextColor(Color.WHITE);
        pageInput.setHintTextColor(0x99FFFFFF);
        pageInput.setBackgroundTintList(ColorStateList.valueOf(GOLD));
        goRow.addView(pageInput, new LinearLayout.LayoutParams(0, -2, 1f));
        TextView go = pill(label("goTo", "انتقال"), true);
        Runnable jump = () -> {
            try {
                showPage(Integer.parseInt(pageInput.getText().toString().trim()), false);
                indexDialog.dismiss();
            } catch (NumberFormatException ignored) {
                pageInput.setError(label("pageHint", "رقم الصفحة") + " (1–604)");
            }
        };
        go.setOnClickListener(v -> jump.run());
        pageInput.setOnEditorActionListener((v, action, event) -> {
            jump.run();
            return true;
        });
        LinearLayout.LayoutParams goParams = new LinearLayout.LayoutParams(-2, -2);
        goParams.setMarginStart(dp(10));
        goRow.addView(go, goParams);
        box.addView(goRow);

        // Tabs.
        LinearLayout tabs = new LinearLayout(this);
        tabs.setOrientation(LinearLayout.HORIZONTAL);
        TextView[] tabViews = {
            pill(label("surahs", "السور"), false),
            pill(label("parts", "الأجزاء"), false),
            pill(label("bookmarks", "العلامات"), false)};
        RecyclerView rows = new RecyclerView(this);
        rows.setLayoutManager(new LinearLayoutManager(this));
        for (int i = 0; i < tabViews.length; i++) {
            final int tab = i;
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, -2, 1f);
            if (i > 0) params.setMarginStart(dp(8));
            tabs.addView(tabViews[i], params);
            tabViews[i].setOnClickListener(v -> selectTab(tab, tabViews, rows));
        }
        box.addView(tabs);
        LinearLayout.LayoutParams rowsParams = new LinearLayout.LayoutParams(-1,
            (int) (getResources().getDisplayMetrics().heightPixels * 0.5f));
        rowsParams.topMargin = dp(10);
        box.addView(rows, rowsParams);

        // Whole-mushaf download.
        TextView download = pill("", false);
        download.setPadding(dp(12), dp(10), dp(12), dp(10));
        LinearLayout.LayoutParams downloadParams = new LinearLayout.LayoutParams(-1, -2);
        downloadParams.topMargin = dp(12);
        box.addView(download, downloadParams);
        bulkListener = (done, total, finished, failed) -> showDownloadState(download, done, finished, failed);
        int have = MushafPages.downloadedCount(this);
        if (MushafPages.isBulkRunning()) {
            MushafPages.downloadAll(this, bulkListener);
        } else {
            showDownloadState(download, have, have == MushafPages.TOTAL, 0);
            if (have < MushafPages.TOTAL) {
                download.setText(label("downloadAll", "تحميل المصحف كاملاً للقراءة بدون إنترنت")
                    + "  (" + num(have) + " / " + num(MushafPages.TOTAL) + ")");
            }
        }
        download.setOnClickListener(v -> {
            if (MushafPages.downloadedCount(this) < MushafPages.TOTAL) MushafPages.downloadAll(this, bulkListener);
        });

        selectTab(0, tabViews, rows);
        indexDialog.setContentView(box);
        indexDialog.show();
        if (indexDialog.getWindow() != null) {
            indexDialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
            indexDialog.getWindow().setLayout((int) (getResources().getDisplayMetrics().widthPixels * 0.92f), -2);
        }
    }

    private void showDownloadState(TextView view, int done, boolean finished, int failed) {
        if (finished && done >= MushafPages.TOTAL) {
            view.setText("✓ " + label("downloaded", "المصحف محمّل كاملاً ويعمل بدون إنترنت"));
        } else if (finished && failed > 0) {
            view.setText(label("downloadFailed", "تعذّر تحميل بعض الصفحات. اضغط لإعادة المحاولة")
                + "  (" + num(done) + " / " + num(MushafPages.TOTAL) + ")");
        } else if (!finished) {
            view.setText(label("downloading", "جاري التحميل") + "…  " + num(done) + " / " + num(MushafPages.TOTAL));
        }
    }

    private void selectTab(int tab, TextView[] tabViews, RecyclerView rows) {
        for (int i = 0; i < tabViews.length; i++) stylePill(tabViews[i], i == tab);
        final List<String[]> items = new ArrayList<>();
        final List<Integer> targets = new ArrayList<>();
        int highlight = -1;
        if (tab == 0) {
            for (int i = 0; i < 114; i++) {
                items.add(new String[]{num(i + 1) + ".  " + surahNames[i], label("page", "صفحة") + " " + num(surahStarts[i])});
                targets.add(surahStarts[i]);
                if (surahStarts[i] <= currentPage) highlight = i;
            }
        } else if (tab == 1) {
            for (int i = 0; i < juzStarts.length; i++) {
                items.add(new String[]{label("juz", "الجزء") + " " + num(i + 1), label("page", "صفحة") + " " + num(juzStarts[i])});
                targets.add(juzStarts[i]);
                if (juzStarts[i] <= currentPage) highlight = i;
            }
        } else {
            for (int page : bookmarks) {
                items.add(new String[]{label("page", "صفحة") + " " + num(page), surahTitle(page)});
                targets.add(page);
            }
            if (items.isEmpty()) items.add(new String[]{label("noBookmarks", "لا توجد علامات بعد"), ""});
        }
        final int current = highlight;
        rows.setAdapter(new RecyclerView.Adapter<RecyclerView.ViewHolder>() {
            @NonNull
            @Override
            public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int type) {
                LinearLayout row = new LinearLayout(parent.getContext());
                row.setOrientation(LinearLayout.HORIZONTAL);
                row.setGravity(Gravity.CENTER_VERTICAL);
                row.setPadding(dp(12), dp(12), dp(12), dp(12));
                row.addView(text("", 16, Color.WHITE, true), new LinearLayout.LayoutParams(0, -2, 1f));
                row.addView(text("", 13, 0xFFB7E4C7, false));
                row.setLayoutParams(new RecyclerView.LayoutParams(-1, -2));
                return new RecyclerView.ViewHolder(row) {};
            }

            @Override
            public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
                LinearLayout row = (LinearLayout) holder.itemView;
                ((TextView) row.getChildAt(0)).setText(items.get(position)[0]);
                ((TextView) row.getChildAt(1)).setText(items.get(position)[1]);
                GradientDrawable bg = new GradientDrawable();
                bg.setCornerRadius(dp(12));
                bg.setColor(position == current ? 0x33FACC15 : Color.TRANSPARENT);
                row.setBackground(bg);
                if (position < targets.size()) {
                    row.setOnClickListener(v -> {
                        showPage(targets.get(position), false);
                        indexDialog.dismiss();
                    });
                    if (tab == 2) {
                        row.setOnLongClickListener(v -> {
                            bookmarks.remove(targets.get(position));
                            saveBookmarks();
                            onPageShown(currentPage);
                            selectTab(2, tabViews, rows);
                            return true;
                        });
                    }
                } else {
                    row.setOnClickListener(null);
                }
            }

            @Override
            public int getItemCount() {
                return items.size();
            }
        });
        if (current > 2) ((LinearLayoutManager) rows.getLayoutManager()).scrollToPositionWithOffset(current - 2, 0);
    }

    // --------------------------------------------------------------- adapters

    private final class PageHolder extends RecyclerView.ViewHolder {
        final SubsamplingScaleImageView image;
        final ProgressBar progress;
        final TextView error;
        int page;

        PageHolder(FrameLayout frame, SubsamplingScaleImageView image, ProgressBar progress, TextView error) {
            super(frame);
            this.image = image;
            this.progress = progress;
            this.error = error;
        }
    }

    private PageHolder holderFor(int position) {
        View inner = pager.getChildAt(0);
        if (!(inner instanceof RecyclerView)) return null;
        RecyclerView.ViewHolder holder = ((RecyclerView) inner).findViewHolderForAdapterPosition(position);
        return holder instanceof PageHolder ? (PageHolder) holder : null;
    }

    /** Horizontal pages: zoomable, and the pager stands still while a page is zoomed. */
    private final class PageAdapter extends RecyclerView.Adapter<PageHolder> {
        @NonNull
        @Override
        public PageHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            FrameLayout frame = new FrameLayout(parent.getContext());
            frame.setLayoutParams(new ViewGroup.LayoutParams(-1, -1));
            SubsamplingScaleImageView image = new SubsamplingScaleImageView(parent.getContext());
            image.setMinimumScaleType(SubsamplingScaleImageView.SCALE_TYPE_CENTER_INSIDE);
            image.setPanLimit(SubsamplingScaleImageView.PAN_LIMIT_INSIDE);
            image.setDoubleTapZoomStyle(SubsamplingScaleImageView.ZOOM_FOCUS_FIXED);
            image.setDoubleTapZoomDuration(220);
            frame.addView(image, new FrameLayout.LayoutParams(-1, -1));
            ProgressBar progress = new ProgressBar(parent.getContext());
            progress.setIndeterminateTintList(ColorStateList.valueOf(0xFF0D9488));
            frame.addView(progress, new FrameLayout.LayoutParams(dp(44), dp(44), Gravity.CENTER));
            TextView error = text("", 15, 0xFF5D4037, true);
            error.setGravity(Gravity.CENTER);
            error.setPadding(dp(32), 0, dp(32), 0);
            frame.addView(error, new FrameLayout.LayoutParams(-1, -2, Gravity.CENTER));
            PageHolder holder = new PageHolder(frame, image, progress, error);

            image.setOnImageEventListener(new SubsamplingScaleImageView.DefaultOnImageEventListener() {
                @Override
                public void onReady() {
                    image.setMaxScale(image.getMinScale() * 4f);
                    image.setDoubleTapZoomScale(image.getMinScale() * 2.2f);
                }
            });
            image.setOnStateChangedListener(new SubsamplingScaleImageView.DefaultOnStateChangedListener() {
                @Override
                public void onScaleChanged(float newScale, int origin) {
                    if (holder.page == currentPage) {
                        pager.setUserInputEnabled(newScale <= image.getMinScale() * 1.03f);
                    }
                }
            });
            GestureDetector taps = new GestureDetector(parent.getContext(), new GestureDetector.SimpleOnGestureListener() {
                @Override
                public boolean onSingleTapConfirmed(MotionEvent e) {
                    toggleBars();
                    return true;
                }
            });
            image.setOnTouchListener((v, event) -> {
                taps.onTouchEvent(event);
                return false;
            });
            error.setOnClickListener(v -> bind(holder, holder.page));
            return holder;
        }

        @Override
        public void onBindViewHolder(@NonNull PageHolder holder, int position) {
            bind(holder, position + 1);
        }

        private void bind(PageHolder holder, int page) {
            holder.page = page;
            holder.image.recycle();
            holder.progress.setVisibility(View.VISIBLE);
            holder.error.setVisibility(View.GONE);
            MushafPages.get(MushafActivity.this, page, new MushafPages.PageListener() {
                @Override
                public void onPage(int p, File file) {
                    if (holder.page != p) return;
                    holder.progress.setVisibility(View.GONE);
                    holder.image.setImage(ImageSource.uri(Uri.fromFile(file)));
                }

                @Override
                public void onFailed(int p) {
                    if (holder.page != p) return;
                    holder.progress.setVisibility(View.GONE);
                    holder.error.setText(label("loadFailed", "تعذّر تحميل الصفحة. تحقّق من الاتصال ثم اضغط لإعادة المحاولة"));
                    holder.error.setVisibility(View.VISIBLE);
                }
            });
        }

        @Override
        public void onViewRecycled(@NonNull PageHolder holder) {
            holder.image.recycle();
        }

        @Override
        public int getItemCount() {
            return MushafPages.TOTAL;
        }
    }

    /** Vertical mode: one continuous column of pages, each as wide as the screen. */
    private final class StripAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {
        @NonNull
        @Override
        public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            int width = getResources().getDisplayMetrics().widthPixels;
            FrameLayout frame = new FrameLayout(parent.getContext());
            frame.setLayoutParams(new RecyclerView.LayoutParams(-1, Math.round(width * PAGE_ASPECT)));
            ImageView image = new ImageView(parent.getContext());
            image.setScaleType(ImageView.ScaleType.FIT_XY);
            image.setBackgroundColor(PAGE_LIGHT);
            frame.addView(image, new FrameLayout.LayoutParams(-1, -1));
            ProgressBar progress = new ProgressBar(parent.getContext());
            progress.setIndeterminateTintList(ColorStateList.valueOf(0xFF0D9488));
            frame.addView(progress, new FrameLayout.LayoutParams(dp(40), dp(40), Gravity.CENTER));
            frame.setOnClickListener(v -> toggleBars());
            return new RecyclerView.ViewHolder(frame) {};
        }

        @Override
        public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
            final int page = position + 1;
            FrameLayout frame = (FrameLayout) holder.itemView;
            ImageView image = (ImageView) frame.getChildAt(0);
            ProgressBar progress = (ProgressBar) frame.getChildAt(1);
            frame.setTag(page);
            Bitmap cached = stripCache.get(page);
            image.setImageBitmap(cached);
            progress.setVisibility(cached == null ? View.VISIBLE : View.GONE);
            if (cached != null) return;
            MushafPages.get(MushafActivity.this, page, new MushafPages.PageListener() {
                @Override
                public void onPage(int p, File file) {
                    decoder.execute(() -> {
                        Bitmap bitmap = BitmapFactory.decodeFile(file.getPath());
                        if (bitmap == null) return;
                        stripCache.put(p, bitmap);
                        runOnUiThread(() -> {
                            if (Integer.valueOf(p).equals(frame.getTag())) {
                                image.setImageBitmap(bitmap);
                                progress.setVisibility(View.GONE);
                            }
                        });
                    });
                }

                @Override
                public void onFailed(int p) {
                    if (Integer.valueOf(p).equals(frame.getTag())) progress.setVisibility(View.GONE);
                }
            });
        }

        @Override
        public int getItemCount() {
            return MushafPages.TOTAL;
        }
    }

    // ---------------------------------------------------------------- helpers

    /** Surahs that begin on this page, or the one that runs through it. */
    private String surahTitle(int page) {
        StringBuilder starting = new StringBuilder();
        int running = 0;
        for (int i = 0; i < 114; i++) {
            if (surahStarts[i] == page) {
                if (starting.length() > 0) starting.append(" · ");
                starting.append(surahNames[i]);
            }
            if (surahStarts[i] <= page) running = i;
        }
        return starting.length() > 0 ? starting.toString() : surahNames[running];
    }

    private int juzOf(int page) {
        int juz = 1;
        for (int i = 0; i < juzStarts.length; i++) if (juzStarts[i] <= page) juz = i + 1;
        return juz;
    }

    private String pageLine(int page) {
        return label("page", "صفحة") + " " + num(page) + " " + label("of", "من") + " " + num(MushafPages.TOTAL)
            + "  ·  " + label("juz", "الجزء") + " " + num(juzOf(page));
    }

    private String num(int value) {
        String latin = String.valueOf(value);
        if (!arabicDigits) return latin;
        StringBuilder out = new StringBuilder();
        for (char c : latin.toCharArray()) out.append(c >= '0' && c <= '9' ? (char) ('٠' + (c - '0')) : c);
        return out.toString();
    }

    private String label(String key, String fallback) {
        String value = labels.getString(key);
        return value == null || value.isEmpty() ? fallback : value;
    }

    private TextView text(String value, int sp, int color, boolean bold) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        view.setTextColor(color);
        if (bold) view.setTypeface(Typeface.DEFAULT_BOLD);
        return view;
    }

    private TextView pill(String value, boolean active) {
        TextView view = text(value, 14, Color.WHITE, true);
        view.setGravity(Gravity.CENTER);
        view.setPadding(dp(14), dp(9), dp(14), dp(9));
        stylePill(view, active);
        return view;
    }

    private void stylePill(TextView view, boolean active) {
        GradientDrawable bg = new GradientDrawable();
        bg.setCornerRadius(dp(14));
        bg.setColor(active ? 0xFF006A4E : 0x1AFFFFFF);
        bg.setStroke(dp(1), active ? GOLD : 0x22FFFFFF);
        view.setBackground(bg);
    }

    private int clamp(int page) {
        return Math.max(1, Math.min(MushafPages.TOTAL, page));
    }

    private int dp(float value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    @Override
    protected void onDestroy() {
        MushafPages.detach(bulkListener);
        if (indexDialog != null) indexDialog.dismiss();
        decoder.shutdownNow();
        stripCache.evictAll();
        if (isFinishing()) MushafPlugin.notifyClosed(currentPage);
        super.onDestroy();
    }

    static int lastPage(Context context) {
        return context.getSharedPreferences(PREFS, MODE_PRIVATE).getInt(KEY_LAST_PAGE, 0);
    }
}
